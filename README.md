# 🚀 Vue 2 to Vue 3 Converter

An intelligent tool to automatically convert Vue 2 components to Vue 3 with Composition API and TypeScript support.

![Vue 2 to Vue 3](https://img.shields.io/badge/Vue%202-to-Vue%203-brightgreen?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## ✨ Features

- ✅ **Automatic Conversion** - Props, data, methods, computed, watchers, lifecycle hooks
- ✅ **Composition API** - Converts Options API to `<script setup>` syntax
- ✅ **TypeScript Support** - Generates typed components with interfaces
- ✅ **Smart Warnings** - Alerts for manual review items
- ✅ **Copy & Download** - Easy export options
- ✅ **Live Preview** - Real-time conversion feedback
- ✅ **Quick Guide** - Built-in documentation

## 📋 What Gets Converted

| Vue 2 | Vue 3 |
|-------|-------|
| `props:` | `defineProps<>()` |
| `data()` | `ref()` |
| `methods:` | Arrow functions |
| `computed:` | `computed()` |
| `watch:` | `watch()` |
| `mounted()` | `onMounted()` |
| `this.$emit()` | `defineEmits<>()` |
| Template & Styles | Preserved as-is |

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ ([Download](https://nodejs.org/))
- npm or yarn

### Installation

```bash
# Clone or download this repository
git clone https://github.com/yourusername/vue2-to-vue3-converter.git
cd vue2-to-vue3-converter

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## 📖 Usage

### Step 1: Paste Vue 2 Component

Copy your entire Vue 2 `.vue` file into the left editor:

```vue
<template>
  <div class="counter">
    <p>Count: {{ count }}</p>
    <button @click="increment">+</button>
  </div>
</template>

<script>
export default {
  name: 'Counter',
  data() {
    return { count: 0 }
  },
  methods: {
    increment() {
      this.count++
    }
  },
  mounted() {
    console.log('Ready!')
  }
}
</script>
```

### Step 2: Click Convert

Click the **🔄 Convert** button to transform your component.

### Step 3: Review & Copy

The converted Vue 3 component appears on the right:

```vue
<template>
  <div class="counter">
    <p>Count: {{ count }}</p>
    <button @click="increment">+</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const count = ref(0)

const increment = () => {
  count.value++
}

onMounted(() => {
  console.log('Ready!')
})
</script>
```

### Step 4: Download or Copy

- **Copy** - Copy to clipboard with `📋 Copy` button
- **Download** - Save as `.vue` file with `⬇️ Download` button

## ⚠️ Important Notes

### Manual Review Required

These items need manual verification:

- **Prop defaults** - Adjust values in `withDefaults()`
- **Watch callbacks** - Review and complete watch logic
- **Emit types** - Define proper TypeScript types
- **Complex watchers** - Add deep watch options if needed
- **Component refs** - Check template references

### Not Converted Automatically

- Custom directives (v-custom)
- Filters (use functions instead)
- Mixins (convert to composables)
- Plugin-specific features
- Complex nested logic

## 📁 Project Structure

```
vue2-to-vue3-converter/
├── src/
│   ├── App.jsx           # Main converter component
│   ├── main.jsx          # React entry point
│   └── index.css         # Tailwind styles
├── public/               # Static assets
├── index.html            # HTML template
├── package.json          # Dependencies
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind configuration
├── postcss.config.js     # PostCSS configuration
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
```

## 🔄 Conversion Examples

### Example 1: Simple Data & Methods

**Vue 2:**
```js
export default {
  data() {
    return { name: 'John', age: 25 }
  },
  methods: {
    greet() {
      console.log(`Hello ${this.name}`)
    }
  }
}
```

**Vue 3:**
```ts
const name = ref('John')
const age = ref(25)

const greet = () => {
  console.log(`Hello ${name.value}`)
}
```

### Example 2: Props & Computed

**Vue 2:**
```js
export default {
  props: {
    count: Number
  },
  computed: {
    doubled() {
      return this.count * 2
    }
  }
}
```

**Vue 3:**
```ts
interface Props {
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})

const doubled = computed(() => props.count * 2)
```

### Example 3: Watchers & Lifecycle

**Vue 2:**
```js
export default {
  watch: {
    count(newVal) {
      console.log('Changed:', newVal)
    }
  },
  mounted() {
    console.log('Component ready')
  }
}
```

**Vue 3:**
```ts
watch(count, (newVal) => {
  console.log('Changed:', newVal)
})

onMounted(() => {
  console.log('Component ready')
})
```

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit changes (`git commit -am 'Add improvement'`)
4. Push to branch (`git push origin feature/improvement`)
5. Open a Pull Request

## 📚 Resources

- [Vue 3 Migration Guide](https://v3-migration.vuejs.org/)
- [Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Support](https://vuejs.org/guide/typescript/overview.html)
- [Tailwind CSS](https://tailwindcss.com/)

## ⚡ Performance Tips

For best results when converting:

1. **Start with small components** - Test on simple components first
2. **Break down large components** - Split into smaller pieces
3. **Test thoroughly** - Always verify the converted output
4. **Use TypeScript** - Define proper types for props and emits
5. **Review warnings** - Don't ignore manual review suggestions

## 🐛 Troubleshooting

### Issue: Conversion not working

**Solution:** Ensure your Vue 2 component has proper structure:
```vue
<template>...</template>
<script>export default { ... }</script>
<style scoped>...</style>
```

### Issue: Props not converting

**Solution:** Make sure props use standard Vue syntax:
```js
// ✅ Correct
props: {
  title: String,
  count: Number
}

// ❌ Won't convert
props: ['title', 'count']
```

### Issue: Complex logic not converting properly

**Solution:** These may need manual adjustment:
- Nested `this` references
- Async methods with `this` binding
- Complex watchers with options

## 📝 Limitations

This converter handles ~80% of typical Vue 2 components. The following may need manual work:

- **Advanced patterns** - Render functions, JSX
- **Plugin features** - Plugin-specific APIs
- **Custom directives** - Must be rewritten
- **Nested components** - May need parent component adjustments
- **Mixins** - Convert to composables manually

## 📄 License

MIT © 2024

## 🙋 Support

Need help? Open an [Issue](https://github.com/yourusername/vue2-to-vue3-converter/issues)

---

## ✅ Checklist for Migration

- [ ] Paste Vue 2 component
- [ ] Run converter
- [ ] Review warnings and messages
- [ ] Adjust prop defaults
- [ ] Complete watch callbacks
- [ ] Define emit types
- [ ] Test component functionality
- [ ] Add to Vue 3 project
- [ ] Run unit tests
- [ ] Deploy!

---

Made with ❤️ for the Vue community
