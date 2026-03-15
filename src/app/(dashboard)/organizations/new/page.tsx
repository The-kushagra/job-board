"use client"

import { CreateOrganization } from "@clerk/nextjs"

export default function NewOrganizationPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 px-4">
      <div className="mb-8 text-center space-y-2">
        <h1 className="text-3xl font-black text-white tracking-tight">Create Your Organization</h1>
        <p className="text-slate-400 font-medium italic">Start hiring top talent with AI-powered ranking.</p>
      </div>
      
      <div className="w-full flex justify-center">
        <CreateOrganization 
          routing="hash"
          afterCreateOrganizationUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "mx-auto shadow-2xl rounded-2xl overflow-hidden border border-white/5",
              card: "bg-slate-900 border-none shadow-none",
              headerTitle: "text-white",
              headerSubtitle: "text-slate-400",
              formButtonPrimary: "bg-primary hover:bg-primary/90 text-white font-bold",
              organizationSwitcherTrigger: "text-white",
              organizationPreviewTextContainer: "text-white",
              organizationPreviewSecondaryText: "text-slate-400",
              formLabel: "text-slate-300 font-bold",
              formInput: "bg-slate-800 border-white/10 text-white focus:border-primary",
            }
          }}
        />
      </div>
    </div>
  )
}
