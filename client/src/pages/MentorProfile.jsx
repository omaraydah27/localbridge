import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getMentorById } from '../api/mentors';
import { createSession } from '../api/sessions';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import SessionTypeCard, { SESSION_TYPES } from '../components/SessionTypeCard';

function BookingModal({ mentor, onClose }) {
    const [selectedType, setSelectedType] = useState(null);
    const [scheduledDate, setScheduledDate] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null); // { ok: bool, message: string }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!selectedType) return;

        setSubmitting(true);
        setResult(null);

        const { error } = await createSession(
            mentor.id,
            selectedType.key,
            scheduledDate || null,
            message || null,
        );

        setSubmitting(false);

        if (error) {
            setResult({ ok: false, message: error.message ?? 'Something went wrong. Please try again.' });
        } else {
            setResult({ ok: true, message: 'Session booked! Your mentor will confirm shortly.' });
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-stone-100">
                    <div>
                        <h2 className="text-xl font-semibold text-stone-900">Book a Session</h2>
                        <p className="text-sm text-stone-500 mt-0.5">with {mentor.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-stone-400 hover:text-stone-600 transition-colors text-2xl leading-none"
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>

                {result?.ok ? (
                    <div className="p-8 text-center">
                        <div className="text-4xl mb-4">🎉</div>
                        <p className="text-lg font-semibold text-stone-900 mb-2">You&apos;re all set!</p>
                        <p className="text-stone-600 mb-6">{result.message}</p>
                        <button
                            onClick={onClose}
                            className="px-6 py-3 rounded-full bg-stone-900 text-amber-50 hover:bg-stone-700 transition-colors"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
                        {/* Session type */}
                        <div>
                            <p className="text-sm font-medium text-stone-700 mb-3">Select session type</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {SESSION_TYPES.map((type) => (
                                    <SessionTypeCard
                                        key={type.key}
                                        type={type}
                                        selected={selectedType?.key === type.key}
                                        onClick={() => setSelectedType(type)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Date/time */}
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1.5" htmlFor="scheduled-date">
                                Preferred date &amp; time <span className="text-stone-400 font-normal">(optional)</span>
                            </label>
                            <input
                                id="scheduled-date"
                                type="datetime-local"
                                value={scheduledDate}
                                onChange={(e) => setScheduledDate(e.target.value)}
                                className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                            />
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1.5" htmlFor="booking-message">
                                Message <span className="text-stone-400 font-normal">(optional)</span>
                            </label>
                            <textarea
                                id="booking-message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={3}
                                placeholder="Tell your mentor what you'd like to focus on..."
                                className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-stone-900 placeholder-stone-400 resize-none focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                            />
                        </div>

                        {result && !result.ok && (
                            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                                {result.message}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={!selectedType || submitting}
                            className="w-full px-6 py-3 rounded-full bg-stone-900 text-amber-50 hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Booking…' : 'Confirm Booking'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default function MentorProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [mentor, setMentor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        getMentorById(id).then(({ data }) => {
            if (!cancelled) {
                setMentor(data);
                setLoading(false);
            }
        });
        return () => { cancelled = true; };
    }, [id]);

    function handleBookClick() {
        if (!user) {
            navigate('/login');
        } else {
            setShowModal(true);
        }
    }

    if (loading) {
        return (
            <main className="max-w-3xl mx-auto px-6 py-12">
                <LoadingSpinner label="Loading mentor profile…" />
            </main>
        );
    }

    return (
        <>
            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
                        {/* Left Side */}
                        <div className="flex-1">
                            <h1 className="text-3xl font-semibold text-stone-900 mb-2">
                                {mentor.name}
                            </h1>

                            <p className="text-lg text-stone-700 mb-1">
                                {mentor.title}
                            </p>

                            <p className="text-stone-500 mb-4">
                                {mentor.company}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {mentor.expertise?.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <p className="text-stone-700 leading-relaxed mb-6">
                                {mentor.bio}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                                    <p className="text-sm text-stone-500">Rating</p>
                                    <p className="text-lg font-semibold text-stone-900">
                                        ⭐ {mentor.rating}
                                    </p>
                                </div>

                                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                                    <p className="text-sm text-stone-500">Experience</p>
                                    <p className="text-lg font-semibold text-stone-900">
                                        {mentor.years_experience} years
                                    </p>
                                </div>

                                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                                    <p className="text-sm text-stone-500">Sessions</p>
                                    <p className="text-lg font-semibold text-stone-900">
                                        1:1 Mentorship
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleBookClick}
                                className="px-6 py-3 rounded-full bg-stone-900 text-amber-50 hover:bg-stone-700 transition-colors"
                            >
                                Book a Session
                            </button>

                            <p className="mt-2 text-sm text-stone-500">
                                Pro plan required for unlimited sessions.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {showModal && (
                <BookingModal mentor={mentor} onClose={() => setShowModal(false)} />
            )}
        </>
    );
}
