import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2, ShieldCheck, ClipboardCheck } from "lucide-react";

export default async function LandingPage() {
  redirect("/dashboard");
  
  // The rest of the code will be unreachable but kept for reference
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="relative isolate overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-36.125rem -translate-x-1/2 rotate-30deg bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-72.1875rem"></div>
      </div>

      <div className="container px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:pt-40">
        <div className="mx-auto max-w-2xl shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
          <div className="mt-24 sm:mt-32 lg:mt-16">
            <a href="#" className="inline-flex space-x-6">
              <span className="rounded-full bg-blue-600/10 px-3 py-1 text-sm font-semibold leading-6 text-blue-600 ring-1 ring-inset ring-blue-600/10">
                What&apos;s new
              </span>
              <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-slate-600">
                <span>Just shipped v1.0</span>
              </span>
            </a>
          </div>
          <h1 className="mt-10 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
            Streamline your <span className="text-blue-600">Customer Support</span> management
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Track company profiles, assets, warranties, and service logs all in one place. Built for teams who care about excellence.
          </p>
          <div className="mt-10 flex items-center gap-x-6">
            <Link href="/register">
              <Button size="lg" className="rounded-full px-8">Get Started</Button>
            </Link>
            <Link href="/login" className="text-sm font-semibold leading-6 text-slate-900">
              Log in <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
          <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="p-8 rounded-2xl bg-white shadow-xl border border-slate-100 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Company Profiles</h3>
                <p className="text-slate-500">Manage tax IDs, contacts, and branch information seamlessly.</p>
              </div>
              <div className="p-8 rounded-2xl bg-white shadow-xl border border-slate-100 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Warranty Tracking</h3>
                <p className="text-slate-500">Never miss a renewal with automated warranty and MA tracking.</p>
              </div>
              <div className="p-8 rounded-2xl bg-white shadow-xl border border-slate-100 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">Service Logging</h3>
                <p className="text-slate-500">Log PM, CM, and on-site visits with precise entry/exit timing.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
