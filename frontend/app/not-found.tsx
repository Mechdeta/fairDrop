import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#080A12] text-white flex flex-col items-center justify-center p-4 text-center">
      <div className="rounded-2xl border border-violet-500/20 bg-violet-950/20 p-8 max-w-md w-full shadow-2xl backdrop-blur-xl">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
          404
        </h1>
        <h2 className="text-lg font-bold text-slate-100 mt-3">Event or Page Not Found</h2>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          The requested page or ticket listing could not be found on FairDrop.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-600/30 hover:opacity-90 transition-opacity"
        >
          Return to Marketplace
        </Link>
      </div>
    </div>
  );
}
