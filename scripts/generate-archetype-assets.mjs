import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const apiBase = 'https://aireiter.com/api/openapi'
const publicAssetBasePath = '/chakras'

const chakraPrompts = {
  root: {
    label: 'root chakra',
    colors: 'deep red, warm clay, charcoal accents',
    traits: 'grounded, reliable, protective, practical',
    prop: 'a small shield, keyring, toolbox, or stable home-life object'
  },
  sacral: {
    label: 'sacral chakra',
    colors: 'orange, coral, peach, warm highlights',
    traits: 'creative, sensual, flowing, expressive',
    prop: 'a paint palette, ribbon, flower, musical note, or flowing scarf'
  },
  solar: {
    label: 'solar plexus chakra',
    colors: 'golden yellow, amber, crisp black accents',
    traits: 'confident, decisive, energetic, entrepreneurial',
    prop: 'a lightning motif, compass, flag, stopwatch, or leadership badge'
  },
  heart: {
    label: 'heart chakra',
    colors: 'emerald green, mint, soft rose highlights',
    traits: 'warm, compassionate, healing, connective',
    prop: 'a heart emblem, plant sprout, cup of tea, or caring gesture'
  },
  throat: {
    label: 'throat chakra',
    colors: 'clear blue, cyan, white highlights',
    traits: 'communicative, truthful, articulate, influential',
    prop: 'a microphone, notebook, megaphone, speech bubble, or pen'
  },
  thirdEye: {
    label: 'third eye chakra',
    colors: 'indigo, violet-blue, silver accents',
    traits: 'strategic, observant, visionary, analytical',
    prop: 'a magnifying glass, telescope, map, eye symbol, or data tablet'
  },
  crown: {
    label: 'crown chakra',
    colors: 'violet, lavender, white, luminous gold accents',
    traits: 'wise, meaningful, spiritual, expansive',
    prop: 'a star, halo-like motif, book, lantern, or subtle geometric crown'
  }
}

function parseArgs() {
  const args = new Map()
  for (const item of process.argv.slice(2)) {
    const [key, value = 'true'] = item.replace(/^--/, '').split('=')
    args.set(key, value)
  }

  return {
    gender: args.get('gender') ?? 'all',
    limit: args.has('limit') ? Number(args.get('limit')) : Infinity,
    force: args.get('force') === 'true',
    quality: args.get('quality') ?? 'medium',
    resolution: args.get('resolution') ?? '1K',
    batchId: args.get('batch-id') ?? 'archetype-image2-v1',
    concurrency: Math.max(1, Number(args.get('concurrency') ?? 2)),
    pollSeconds: Math.max(5, Number(args.get('poll-seconds') ?? 10)),
    maxPolls: Math.max(6, Number(args.get('max-polls') ?? 48))
  }
}

function slugifyCode(code) {
  return code
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function pathExists(filePath) {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

function parseArchetypes(source) {
  const mapStart = source.indexOf('export const archetypeMap')
  const mapEnd = source.indexOf('const growthThemeMap', mapStart)
  if (mapStart < 0 || mapEnd < 0) {
    throw new Error('Unable to locate archetypeMap in src/lib/chakra-archetypes.ts')
  }

  const mapSource = source.slice(mapStart, mapEnd)
  const entryRegex = /^\s{2}([A-Za-z]+_[A-Za-z]+): \{([\s\S]*?)^\s{2}\},?/gm
  const items = []
  let match

  while ((match = entryRegex.exec(mapSource))) {
    const [, key, body] = match
    const name = body.match(/name: '([^']+)'/)?.[1]
    const family = body.match(/family: '([^']+)'/)?.[1]
    const code = body.match(/code: '([^']+)'/)?.[1]
    const headline = body.match(/headline: '([^']+)'/)?.[1]
    const [primaryKey, secondaryKey] = key.split('_')

    if (!name || !family || !code || !headline || !chakraPrompts[primaryKey] || !chakraPrompts[secondaryKey]) {
      throw new Error(`Unable to parse archetype entry: ${key}`)
    }

    items.push({ key, primaryKey, secondaryKey, name, family, code, headline, slug: slugifyCode(code) })
  }

  if (items.length !== 42) {
    throw new Error(`Expected 42 archetypes, parsed ${items.length}`)
  }

  return items
}

function buildPrompt(item, gender) {
  const primary = chakraPrompts[item.primaryKey]
  const secondary = chakraPrompts[item.secondaryKey]
  const genderLabel = gender === 'female' ? 'female' : 'male'

  return [
    'Use case: stylized-concept',
    'Asset type: square website archetype card character art',
    `Primary request: Generate one full-body ${genderLabel} cartoon character representing the Chinese chakra archetype "${item.name}" (${item.code}).`,
    `Archetype meaning: ${item.headline}`,
    'Style: polished low-poly personality-card cartoon illustration, angular faceted shapes, friendly expression, clean silhouette, modern editorial mascot quality, similar in spirit to a MBTI character chart but original.',
    `Character direction: primary ${primary.label} energy: ${primary.traits}; use ${primary.colors} as the outfit foundation.`,
    `Secondary detail: ${secondary.label} energy: ${secondary.traits}; include one subtle accessory such as ${secondary.prop}, using ${secondary.colors}.`,
    'Composition: single character only, centered, full body visible from head to shoes, 3/4 front view, generous padding, white background.',
    'Series consistency: same proportions, clean vector-like rendering, crisp edges, no photorealism, no 3D render, no background scene.',
    'Do not include text, letters, labels, logos, watermarks, borders, UI, captions, or the archetype name inside the image.'
  ].join('\n')
}

async function requestJson(endpoint, apiKey, body) {
  let lastError

  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const response = await fetch(`${apiBase}${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })
      const text = await response.text()
      let json
      try {
        json = JSON.parse(text)
      } catch {
        throw new Error(`Non-JSON response from ${endpoint}: ${text.slice(0, 300)}`)
      }

      if (!response.ok || json.error || json.statusCode >= 400 || json.code >= 400) {
        const message = json.error?.message || json.message || text.slice(0, 300)
        const retryable = response.status === 429 || response.status >= 500 || json.error?.type === 'rate_limit_error'
        if (retryable && attempt < 5) {
          await sleep(attempt * 2500)
          continue
        }
        throw new Error(`Aireiter ${endpoint} failed: ${message}`)
      }

      return json
    } catch (error) {
      lastError = error
      if (attempt === 5) break
      await sleep(attempt * 2500)
    }
  }

  throw lastError
}

function unwrapData(json) {
  if (Array.isArray(json.data)) {
    return json.data[0]
  }
  return json.data
}

async function submitJob(job, apiKey, options) {
  const json = await requestJson('/submit', apiKey, {
    model: 'gpt_image_2_official',
    params: {
      prompt: buildPrompt(job.item, job.gender),
      aspect_ratio: '1:1',
      resolution: options.resolution,
      quality: options.quality
    },
    out_task_id: job.outTaskId
  })

  return unwrapData(json) ?? {}
}

function getOutputUrl(data) {
  if (!data) return undefined
  if (Array.isArray(data.output) && data.output[0]?.url) return data.output[0].url
  if (Array.isArray(data.data) && data.data[0]?.url) return data.data[0].url
  if (data.url) return data.url
  return undefined
}

async function pollJob(job, apiKey, options) {
  for (let attempt = 1; attempt <= options.maxPolls; attempt++) {
    const json = await requestJson('/query', apiKey, { out_task_id: job.outTaskId })
    const data = unwrapData(json)
    const status = data?.status ?? 'unknown'
    const url = getOutputUrl(data)

    if (url && ['completed', 'succeeded', 'success', 'finished'].includes(status)) {
      return { data, url }
    }

    if (['failed', 'error', 'canceled', 'cancelled'].includes(status)) {
      throw new Error(`Task ${job.outTaskId} ended with status ${status}: ${JSON.stringify(data).slice(0, 500)}`)
    }

    process.stdout.write(`poll ${job.gender}/${job.item.slug} ${attempt}/${options.maxPolls}: ${status}\n`)
    await sleep(options.pollSeconds * 1000)
  }

  throw new Error(`Task ${job.outTaskId} timed out`)
}

async function downloadImage(url, outPath) {
  let response
  let lastError

  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      response = await fetch(url)
      if (response.ok) break
      lastError = new Error(`Download failed (${response.status}) for ${url}`)
    } catch (error) {
      lastError = error
    }

    await sleep(attempt * 2500)
  }

  if (!response?.ok) {
    throw lastError
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  await sharp(buffer)
    .resize(1024, 1024, { fit: 'contain', background: '#ffffff' })
    .webp({ quality: 88 })
    .toFile(outPath)
}

async function generateJob(job, apiKey, options) {
  if (!options.force && await pathExists(job.outPath)) {
    process.stdout.write(`skip existing ${job.gender}/${job.item.slug}\n`)
    return { skipped: true, ...job }
  }

  let submitted = {}
  try {
    const existingJson = await requestJson('/query', apiKey, { out_task_id: job.outTaskId })
    const existingData = unwrapData(existingJson)
    const existingStatus = existingData?.status ?? 'unknown'
    const existingUrl = getOutputUrl(existingData)

    if (existingUrl && ['completed', 'succeeded', 'success', 'finished'].includes(existingStatus)) {
      process.stdout.write(`reuse completed ${job.gender}/${job.item.slug} ${job.outTaskId}\n`)
      await downloadImage(existingUrl, job.outPath)
      return {
        ...job,
        skipped: false,
        taskId: existingData?.task_id,
        remoteUrl: existingUrl,
        creditsUsed: existingData?.credits_used
      }
    }

    if (['pending', 'processing', 'submitted', 'running'].includes(existingStatus)) {
      process.stdout.write(`resume ${job.gender}/${job.item.slug} ${job.outTaskId}: ${existingStatus}\n`)
      const { data, url } = await pollJob(job, apiKey, options)
      await downloadImage(url, job.outPath)
      process.stdout.write(`saved ${path.relative(rootDir, job.outPath)}\n`)
      return {
        ...job,
        skipped: false,
        taskId: data?.task_id,
        remoteUrl: url,
        creditsUsed: data?.credits_used
      }
    }
  } catch {
    // Unknown task IDs are expected on first generation.
  }

  process.stdout.write(`submit ${job.gender}/${job.item.slug} ${job.outTaskId} ${job.item.name}\n`)
  submitted = await submitJob(job, apiKey, options)
  const { data, url } = await pollJob(job, apiKey, options)
  await downloadImage(url, job.outPath)
  process.stdout.write(`saved ${path.relative(rootDir, job.outPath)}\n`)

  return {
    ...job,
    skipped: false,
    taskId: submitted.task_id ?? data?.task_id,
    remoteUrl: url,
    creditsUsed: data?.credits_used
  }
}

async function main() {
  const apiKey = process.env.AIREITER_API_KEY
  if (!apiKey) {
    throw new Error('Missing AIREITER_API_KEY environment variable')
  }

  const options = parseArgs()
  const genders = options.gender === 'all' ? ['female', 'male'] : [options.gender]
  if (!genders.every(gender => gender === 'female' || gender === 'male')) {
    throw new Error('--gender must be female, male, or all')
  }

  const source = await readFile(path.join(rootDir, 'src/lib/chakra-archetypes.ts'), 'utf8')
  const archetypes = parseArchetypes(source)
  const jobs = []

  for (const gender of genders) {
    await mkdir(path.join(rootDir, 'public/archetypes', gender), { recursive: true })
    for (const item of archetypes) {
      jobs.push({
        item,
        gender,
        outTaskId: `chakras-${options.batchId}-${gender}-${item.slug}`,
        outPath: path.join(rootDir, 'public/archetypes', gender, `${item.slug}.webp`)
      })
    }
  }

  const selectedJobs = jobs.slice(0, options.limit)
  const results = []
  const errors = []
  let cursor = 0

  async function worker() {
    while (cursor < selectedJobs.length) {
      const job = selectedJobs[cursor++]
      try {
        results.push(await generateJob(job, apiKey, options))
      } catch (error) {
        errors.push({ job, error })
        process.stderr.write(`error ${job.gender}/${job.item.slug}: ${error.message}\n`)
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(options.concurrency, selectedJobs.length) }, worker))

  const manifest = results
    .sort((a, b) => `${a.gender}/${a.item.slug}`.localeCompare(`${b.gender}/${b.item.slug}`))
    .map(result => ({
      key: result.item.key,
      gender: result.gender,
      name: result.item.name,
      code: result.item.code,
      src: `${publicAssetBasePath}/archetypes/${result.gender}/${result.item.slug}.webp`,
      taskId: result.taskId,
      remoteUrl: result.remoteUrl,
      creditsUsed: result.creditsUsed,
      skipped: result.skipped
    }))

  await writeFile(
    path.join(rootDir, 'public/archetypes/manifest.json'),
    `${JSON.stringify({ generatedAt: new Date().toISOString(), count: manifest.length, items: manifest }, null, 2)}\n`,
    'utf8'
  )

  if (errors.length > 0) {
    throw new Error(`${errors.length} image jobs failed`)
  }

  process.stdout.write(`done ${results.length} jobs\n`)
}

main().catch(error => {
  process.stderr.write(`${error.stack || error.message}\n`)
  process.exit(1)
})
