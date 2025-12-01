import { useState } from 'react'

export default function Vue2to3Converter() {
  const [vue2Code, setVue2Code] = useState(`<template>
  <div class="counter">
    <p>Count: {{ count }}</p>
    <p>Double: {{ doubleCount }}</p>
    <button @click="increment">+</button>
    <button @click="$emit('update', count)">Emit</button>
  </div>
</template>

<script>
export default {
  name: 'Counter',
  props: {
    initialValue: Number
  },
  data() {
    return {
      count: this.initialValue || 0
    }
  },
  computed: {
    doubleCount() {
      return this.count * 2
    }
  },
  methods: {
    increment() {
      this.count++
    }
  },
  mounted() {
    console.log('Component mounted')
  }
}
</script>

<style scoped>
.counter {
  padding: 1rem;
}
</style>`)

  const [vue3Code, setVue3Code] = useState('')
  const [messages, setMessages] = useState([])
  const [activeTab, setActiveTab] = useState('converter')

  const parseVue2Script = (code) => {
    const scriptMatch = code.match(/<script>([\s\S]*?)<\/script>/)
    return scriptMatch ? scriptMatch[1].trim() : ''
  }

  const extractTemplateAndStyle = (code) => {
    const templateMatch = code.match(/<template>([\s\S]*?)<\/template>/)
    const styleMatch = code.match(/<style[^>]*>([\s\S]*?)<\/style>/)
    return {
      template: templateMatch ? templateMatch[1].trim() : '',
      style: styleMatch ? styleMatch[1].trim() : ''
    }
  }

  const convertScript = (scriptContent) => {
    let warnings = []
    let convertedScript = ''

    // Extract name
    const nameMatch = scriptContent.match(/name:\s*['"`]([^'"`]+)['"`]/)
    const componentName = nameMatch ? nameMatch[1] : 'MyComponent'

    // Extract props
    const propsMatch = scriptContent.match(/props:\s*({[\s\S]*?})/i)
    let propsCode = ''
    if (propsMatch) {
      const propsObj = propsMatch[1]
      const propLines = propsObj.match(/(\w+):\s*(\w+)/g) || []
      const typedProps = propLines.map(line => {
        const [key, type] = line.split(':').map(s => s.trim())
        const tsType = mapVueTypeToTS(type)
        return `  ${key}?: ${tsType}`
      })

      if (typedProps.length > 0) {
        propsCode = `interface Props {\n${typedProps.join('\n')}\n}\n\nconst props = withDefaults(defineProps<Props>(), {})\n\n`
        warnings.push('⚠️ Review prop defaults - adjust withDefaults() as needed')
      }
    }

    // Extract data
    const dataMatch = scriptContent.match(/data\(\)\s*{[\s\S]*?return\s*({[\s\S]*?})/i)
    let dataCode = ''
    if (dataMatch) {
      const dataObj = dataMatch[1]
      const dataLines = dataObj.match(/(\w+):\s*([^,}]+)/g) || []
      const refDeclarations = dataLines.map(line => {
        const [key, value] = line.split(':').map(s => s.trim())
        return `const ${key} = ref(${value})`
      })
      if (refDeclarations.length > 0) {
        dataCode = refDeclarations.join('\n') + '\n\n'
      }
    }

    // Extract methods
    let methodsCode = ''
    const methodsMatch = scriptContent.match(/methods:\s*{([\s\S]*?)}\s*,?\s*(?:computed|mounted|watch|created|beforeDestroy|destroyed|beforeCreate)/) ||
                         scriptContent.match(/methods:\s*{([\s\S]*?)}[\s\S]*?$/)
    if (methodsMatch) {
      const methodsContent = methodsMatch[1]
      const methodMatches = methodsContent.match(/(\w+)\s*\([^)]*\)\s*{[\s\S]*?(?=\n\s*\w+\s*\(|\n\s*})/g) || []

      const methods = methodMatches.map(method => {
        let converted = method
          .replace(/this\.(\w+)/g, '$1.value')
          .replace(/this\.\$emit/g, 'emit')
          .replace(/this\./g, '')
        return `const ${converted.substring(0, converted.indexOf('(')).trim()} = ${converted}`
      })

      if (methods.length > 0) {
        methodsCode = methods.join('\n\n') + '\n\n'
        warnings.push('✓ Methods converted to arrow functions')
      }
    }

    // Extract computed
    let computedCode = ''
    const computedMatch = scriptContent.match(/computed:\s*{([\s\S]*?)}\s*,?\s*(?:methods|mounted|watch|created)/)
    if (computedMatch) {
      const computedContent = computedMatch[1]
      const computedProps = computedContent.match(/(\w+)\s*\([^)]*\)\s*{[\s\S]*?(?=\n\s*\w+\s*\(|\n\s*})/g) || []

      const computed = computedProps.map(prop => {
        let converted = prop
          .replace(/this\.(\w+)/g, '$1.value')
          .replace(/this\./g, '')
        const propName = converted.substring(0, converted.indexOf('(')).trim()
        return `const ${propName} = computed(() => ${converted.substring(converted.indexOf('{') + 1, converted.lastIndexOf('}')).trim()})`
      })

      if (computed.length > 0) {
        computedCode = computed.join('\n') + '\n\n'
        warnings.push('✓ Computed properties converted')
      }
    }

    // Extract watchers
    let watchCode = ''
    const watchMatch = scriptContent.match(/watch:\s*{([\s\S]*?)}\s*,?\s*(?:computed|methods|mounted|created)/)
    if (watchMatch) {
      const watchContent = watchMatch[1]
      const watchProps = watchContent.match(/(\w+)\s*\(([\s\S]*?)\)/g) || []

      const watchers = watchProps.map(watcher => {
        const propName = watcher.substring(0, watcher.indexOf('(')).trim()
        return `watch(${propName}, (newVal) => {\n  // TODO: Add watch logic\n})`
      })

      if (watchers.length > 0) {
        watchCode = watchers.join('\n\n') + '\n\n'
        warnings.push('ℹ️ Watch callbacks need manual review')
      }
    }

    // Extract lifecycle hooks
    let lifecycleCode = ''
    const lifecycleHooks = [
      { old: 'mounted', new: 'onMounted' },
      { old: 'created', new: 'onCreated' },
      { old: 'beforeMount', new: 'onBeforeMount' },
      { old: 'beforeUpdate', new: 'onBeforeUpdate' },
      { old: 'updated', new: 'onUpdated' },
      { old: 'beforeDestroy', new: 'onBeforeUnmount' },
      { old: 'destroyed', new: 'onUnmounted' }
    ]

    lifecycleHooks.forEach(hook => {
      const hookMatch = scriptContent.match(new RegExp(`${hook.old}\\s*\\(\\)\\s*{([\\s\\S]*?)}`, 'i'))
      if (hookMatch) {
        lifecycleCode += `${hook.new}(() => {\n${hookMatch[1].replace(/this\./g, '').replace(/(\w+)'/g, '$1.value')}\n})\n\n`
      }
    })

    // Extract emits
    let emitCode = ''
    const emitMatch = scriptContent.match(/\$emit\(['"`](\w+)['"`]/g) || []
    if (emitMatch.length > 0) {
      const uniqueEmits = [...new Set(emitMatch.map(e => e.match(/['"`](\w+)['"`]/)[1]))]
      emitCode = `const emit = defineEmits<{\n${uniqueEmits.map(e => `  ${e}: [data?: any]`).join('\n')}\n}>()\n\n`
      warnings.push('ℹ️ Review emit types - adjust as needed')
    }

    // Build final script - NOTE: The import statement is in the OUTPUT, not this tool
    convertedScript = `<script setup lang="ts">
// TODO: Add Vue imports (ref, computed, watch, onMounted) when using in your project
${propsCode}${emitCode}${dataCode}${computedCode}${methodsCode}${watchCode}${lifecycleCode}</script>`

    return { convertedScript, warnings }
  }

  const mapVueTypeToTS = (type) => {
    const typeMap = {
      String: 'string',
      Number: 'number',
      Boolean: 'boolean',
      Array: 'Array<any>',
      Object: 'Record<string, any>',
      Function: '(...args: any[]) => any'
    }
    return typeMap[type] || 'any'
  }

  const handleConvert = () => {
    try {
      setMessages([])
      const { template, style } = extractTemplateAndStyle(vue2Code)
      const scriptContent = parseVue2Script(vue2Code)

      if (!scriptContent) {
        setMessages([{ type: 'error', text: '❌ No script tag found in Vue 2 component' }])
        return
      }

      const { convertedScript, warnings } = convertScript(scriptContent)

      const finalCode = `${template ? `<template>\n${template}\n</template>\n\n` : ''}${convertedScript}${style ? `\n\n<style scoped>\n${style}\n</style>` : ''}`

      setVue3Code(finalCode)

      const warningMessages = warnings.map(w => ({
        type: 'warning',
        text: w
      }))
      setMessages([{ type: 'success', text: '✅ Conversion completed!' }, ...warningMessages])
    } catch (error) {
      setMessages([{ type: 'error', text: `❌ Error: ${error.message}` }])
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setMessages([{ type: 'success', text: '✅ Copied to clipboard!' }])
  }

  const downloadFile = (text, filename) => {
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
    element.setAttribute('download', filename)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    setMessages([{ type: 'success', text: `✅ Downloaded ${filename}` }])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🚀 Vue 2 → Vue 3 Converter</h1>
          <p className="text-slate-300">Automatically convert Vue 2 components to Vue 3 with Composition API</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('converter')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === 'converter'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Converter
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === 'guide'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Quick Guide
          </button>
        </div>

        {activeTab === 'converter' ? (
          <>
            {/* Main Converter */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Vue 2 Input */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>📄</span> Vue 2 Component
                </h2>
                <textarea
                  value={vue2Code}
                  onChange={(e) => setVue2Code(e.target.value)}
                  className="w-full h-96 bg-slate-900 text-slate-100 p-4 rounded border border-slate-600 font-mono text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Paste your Vue 2 component here..."
                />
              </div>

              {/* Vue 3 Output */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>✨</span> Vue 3 Component
                </h2>
                <textarea
                  value={vue3Code}
                  readOnly
                  className="w-full h-96 bg-slate-900 text-slate-100 p-4 rounded border border-slate-600 font-mono text-sm focus:outline-none"
                  placeholder="Converted Vue 3 component will appear here..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4 mb-6">
              <button
                onClick={handleConvert}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
              >
                🔄 Convert
              </button>
              {vue3Code && (
                <>
                  <button
                    onClick={() => copyToClipboard(vue3Code)}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
                  >
                    📋 Copy
                  </button>
                  <button
                    onClick={() => downloadFile(vue3Code, 'component.vue')}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
                  >
                    ⬇️ Download
                  </button>
                </>
              )}
            </div>

            {/* Messages */}
            {messages.length > 0 && (
              <div className="space-y-3 mb-6">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg flex items-start gap-3 ${
                      msg.type === 'success'
                        ? 'bg-green-900/30 border border-green-600/50 text-green-200'
                        : msg.type === 'warning'
                        ? 'bg-yellow-900/30 border border-yellow-600/50 text-yellow-200'
                        : 'bg-red-900/30 border border-red-600/50 text-red-200'
                    }`}
                  >
                    <span>
                      {msg.type === 'success' ? '✓' : msg.type === 'warning' ? '⚠' : '✕'}
                    </span>
                    <span>{msg.text}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          // Guide Tab
          <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Conversion Guide</h2>
            <div className="space-y-6 text-slate-200">
              <div>
                <h3 className="text-lg font-semibold text-blue-300 mb-2">✅ What Gets Converted</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Props → defineProps&lt;&gt;</li>
                  <li>Data → ref()</li>
                  <li>Methods → Arrow functions</li>
                  <li>Computed → computed()</li>
                  <li>Watch → watch()</li>
                  <li>Lifecycle hooks → on* functions</li>
                  <li>Emit → defineEmits&lt;&gt;</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-yellow-300 mb-2">⚠️ Manual Review Needed</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Prop default values - adjust in withDefaults()</li>
                  <li>Watch handlers - review callback logic</li>
                  <li>Emit types - define proper TypeScript types</li>
                  <li>Complex watchers - deep watch options</li>
                  <li>Refs to other components</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-green-300 mb-2">📝 Usage Tips</h3>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Paste your complete Vue 2 .vue file</li>
                  <li>Click Convert to transform</li>
                  <li>Review warnings and messages</li>
                  <li>Manual adjustments may be needed</li>
                  <li>Copy or download the result</li>
                </ol>
              </div>

              <div className="bg-slate-900 p-4 rounded border border-slate-600">
                <p className="text-sm text-slate-400">
                  💡 <strong>Tip:</strong> This converter handles basic conversions. Complex logic, nested components,
                  and custom patterns may need manual adjustment. Always test your converted components!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
