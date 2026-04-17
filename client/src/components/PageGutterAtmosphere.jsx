/** Decorative viewport gutters for wide screens (mentors directory, profiles, etc.) */
export default function PageGutterAtmosphere() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-0 left-0 top-16 z-0 hidden w-[min(24vw,15rem)] bg-gradient-to-r from-orange-200/55 from-10% via-amber-100/28 via-45% to-transparent lg:block"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-0 right-0 top-16 z-0 hidden w-[min(24vw,15rem)] bg-gradient-to-l from-amber-100/50 from-10% via-orange-100/25 via-45% to-transparent lg:block"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -left-20 top-24 z-0 hidden h-[min(20rem,42vh)] w-[min(20rem,38vw)] rounded-full bg-orange-300/40 blur-3xl lg:block xl:-left-16 xl:top-32 xl:h-[22rem] xl:w-[22rem]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -right-24 top-[38%] z-0 hidden h-[min(22rem,45vh)] w-[min(22rem,40vw)] rounded-full bg-amber-200/45 blur-3xl lg:block xl:-right-20"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-24 left-[8%] z-0 hidden h-48 w-48 rounded-full bg-orange-200/25 blur-3xl lg:block xl:left-[12%]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed top-16 z-0 hidden h-[calc(100vh-4rem)] w-px bg-gradient-to-b from-transparent via-orange-400/35 to-transparent supports-[height:100dvh]:h-[calc(100dvh-4rem)] xl:block"
        style={{ left: 'max(0.5rem, calc(50vw - 36rem - 1rem))' }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed top-16 z-0 hidden h-[calc(100vh-4rem)] w-px bg-gradient-to-b from-transparent via-orange-400/35 to-transparent supports-[height:100dvh]:h-[calc(100dvh-4rem)] xl:block"
        style={{ left: 'min(calc(100vw - 0.5rem), calc(50vw + 36rem + 1rem))' }}
      />
    </>
  );
}
