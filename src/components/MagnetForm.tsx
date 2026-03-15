import { Magnet, Hash, FileText, HardDrive, ChevronDown, ChevronUp, Wand2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form'
import { DEFAULT_TRACKERS, isValidHash, parseMagnetLink } from '@/lib/magnet'
import type { ShareTargetData } from '@/hooks/useShareTarget'
import * as React from 'react'

const schema = z.object({
  hash: z
    .string()
    .min(1, 'Hash is required')
    .refine(v => isValidHash(v.trim()), 'Invalid hash — expected 40 hex (SHA-1), 32 base32 (BTIHv1), or 64 hex (SHA-256) chars'),
  name: z.string().optional(),
  sizeBytes: z
    .string()
    .optional()
    .refine(v => !v || (!isNaN(Number(v)) && Number(v) >= 0), 'Must be a positive number'),
  trackers: z.string().min(1, 'At least one tracker is required'),
})

type FormValues = z.infer<typeof schema>

interface MagnetFormProps {
  onGenerate: (params: { name: string; hash: string; trackers: string[]; sizeBytes?: number }) => void
  shareData?: ShareTargetData | null
}

export function MagnetForm({ onGenerate, shareData }: MagnetFormProps) {
  const [showAdvanced, setShowAdvanced] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      hash: '',
      name: '',
      sizeBytes: '',
      trackers: DEFAULT_TRACKERS.join('\n'),
    },
  })

  // Pre-fill form when share target data arrives
  React.useEffect(() => {
    if (!shareData) return
    form.reset({
      hash: shareData.hash,
      name: shareData.name,
      sizeBytes: '',
      trackers: DEFAULT_TRACKERS.join('\n'),
    })
  }, [shareData, form])

  // Auto-parse a pasted full magnet link
  const handleHashChange = (val: string) => {
    form.setValue('hash', val, { shouldValidate: false })
    if (val.startsWith('magnet:?')) {
      const parsed = parseMagnetLink(val)
      if (parsed) {
        if (parsed.hash)              form.setValue('hash', parsed.hash)
        if (parsed.name)              form.setValue('name', parsed.name)
        if (parsed.sizeBytes)         form.setValue('sizeBytes', String(parsed.sizeBytes))
        if (parsed.trackers?.length)  form.setValue('trackers', parsed.trackers.join('\n'))
      }
    }
  }

  const onSubmit = (values: FormValues) => {
    const trackers = values.trackers.split('\n').map(t => t.trim()).filter(Boolean)
    const sizeBytes = values.sizeBytes ? Number(values.sizeBytes) : undefined
    onGenerate({ hash: values.hash.trim(), name: values.name?.trim() ?? '', trackers, sizeBytes })
  }

  return (
    <Card className="glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Magnet className="text-primary" size={20} />
          Generate Magnet Link
        </CardTitle>
        <CardDescription>Paste a hash or an existing magnet link to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">

            {/* Hash */}
            <FormField
              control={form.control}
              name="hash"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Hash size={12} /> Info Hash / Magnet Link *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={e => handleHashChange(e.target.value)}
                      placeholder="e.g. a3c8b1… or paste full magnet:?"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <FileText size={12} /> Display Name
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Ubuntu 24.04 LTS" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Advanced toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(v => !v)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
            >
              {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              Advanced options
            </button>

            {showAdvanced && (
              <div className="flex flex-col gap-4 rounded-lg border border-border p-4 bg-background/50">

                {/* File size */}
                <FormField
                  control={form.control}
                  name="sizeBytes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <HardDrive size={12} /> File Size (bytes)
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min={0} placeholder="e.g. 1073741824" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Trackers */}
                <FormField
                  control={form.control}
                  name="trackers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trackers (one per line)</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={5} className="font-mono text-xs" spellCheck={false} />
                      </FormControl>
                      <FormDescription>
                        <button
                          type="button"
                          className="hover:text-primary transition-colors"
                          onClick={() => form.setValue('trackers', DEFAULT_TRACKERS.join('\n'))}
                        >
                          Reset to defaults
                        </button>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <Button type="submit" size="lg" className="mt-2 w-full font-semibold">
              <Wand2 size={16} />
              Generate
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
