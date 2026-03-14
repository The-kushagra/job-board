"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { jobListingSchema } from "@/server/schemas/jobListings"
import { createJobListing } from "@/server/actions/jobListings"
import { useState } from "react"
import { 
  jobListingTypeEnum, 
  experienceLevelEnum, 
  locationRequirementEnum, 
  wageIntervalEnum 
} from "@/drizzle/schema"
import { Sparkles } from "lucide-react"
import { generateJobDescriptionAction } from "@/server/actions/aiTools"

type JobListingFormValues = z.infer<typeof jobListingSchema>

export function JobListingForm({ organizationId }: { organizationId: string }) {
  const [error, setError] = useState<string | null>(null)
  
  const form = useForm<JobListingFormValues>({
    resolver: zodResolver(jobListingSchema),
    defaultValues: {
      title: "",
      description: "",
      organizationId,
      wage: 0,
      wageInterval: "yearly",
      locationRequirement: "remote",
      experienceLevel: "mid-level",
      type: "full-time",
    },
  })

  async function onSubmit(values: JobListingFormValues) {
    const result = await createJobListing(values as any)
    if (result?.error) {
      setError(result.error)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Job Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control as any}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Software Engineer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Description</FormLabel>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-xs gap-1.5 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary"
                      onClick={async () => {
                        const title = form.getValues("title")
                        if (!title) return setError("Please enter a job title first.")
                        
                        setError(null)
                        const res = await generateJobDescriptionAction(title)
                        if ("error" in res && res.error) {
                          setError(res.error)
                        } else if ("description" in res && res.description) {
                          form.setValue("description", res.description)
                        }
                      }}
                    >
                      <Sparkles className="size-3" />
                      Magic Draft
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the role and requirements..." 
                      className="min-h-[150px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {jobListingTypeEnum.enumValues.map(t => (
                           <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="locationRequirement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                         {locationRequirementEnum.enumValues.map(l => (
                           <SelectItem key={l} value={l} className="capitalize">{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="wage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary / Wage</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="wageInterval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interval</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Interval" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                         {wageIntervalEnum.enumValues.map(i => (
                           <SelectItem key={i} value={i} className="capitalize">{i}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            
            <div className="flex justify-end gap-3">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Posting..." : "Post Job Listing"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
