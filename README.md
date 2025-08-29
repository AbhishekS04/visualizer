# 🚀 Algorithm Visualizer

An interactive, real-time algorithm visualization tool built with **Next.js**, **TypeScript**, **GSAP animations**, and **Tailwind CSS**. Experience sorting and searching algorithms like never before with smooth animations, live complexity tracking, and detailed step-by-step explanations.

> ⚠️ **Project Status**: This project is currently under active development. New features, improvements, and optimizations are being added regularly.

## ✨ Features

### 🔄 Sorting Algorithms
- **Bubble Sort** - Compare adjacent elements and swap if out of order
- **Selection Sort** - Find minimum element and place at beginning
- **Insertion Sort** - Build sorted array one element at a time
- **Merge Sort** - Divide and conquer with recursive splitting and merging
- **Quick Sort** - Partition-based divide and conquer algorithm

### 🔍 Searching Algorithms
- **Linear Search** - Sequential element-by-element search
- **Binary Search** - Logarithmic search on sorted arrays
- **Jump Search** - Square root block jumping with linear scan

### 🎨 Visualization Modes
- **Number Blocks** - Visual blocks displaying actual values with highlighting
- **Bar Charts** - Traditional height-based bar visualization
- **Interactive Controls** - Real-time speed adjustment, array size control
- **Smooth Animations** - GSAP-powered fluid transitions and highlighting

### 📊 Live Analytics
- **Real-time Metrics** - Track comparisons, swaps, writes, and probes
- **Complexity Analysis** - View theoretical vs actual performance
- **Step-by-Step Logging** - Detailed process explanations
- **Execution Timing** - Precise millisecond tracking

## 🛠️ Tech Stack

### Frontend
- **[Next.js 15.5.2](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - Latest React with concurrent features
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS 4.1.9](https://tailwindcss.com/)** - Modern utility-first styling
- **[GSAP](https://greensock.com/gsap/)** - Professional animation library

### UI Components
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Lucide React](https://lucide.dev/)** - Beautiful icon system
- **[Sonner](https://sonner.emilkowal.ski/)** - Elegant toast notifications

### Backend (Optional)
- **[FastAPI](https://fastapi.tiangolo.com/)** - Python-based API for algorithm processing
- **[Pydantic](https://pydantic-docs.helpmanual.io/)** - Data validation and serialization

### Development Tools
- **[PNPM](https://pnpm.io/)** - Fast, disk space efficient package manager
- **[ESLint](https://eslint.org/)** - Code linting and formatting
- **[PostCSS](https://postcss.org/)** - CSS transformation and optimization

## 🚦 Getting Started

### Prerequisites
- **Node.js** 18+ 
- **PNPM** (recommended) or npm
- **Python 3.8+** (if using backend API)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/algorithm-visualizer.git
cd algorithm-visualizer
```

2. **Install dependencies**
```bash
pnpm install
# or
npm install
```

3. **Start the development server**
```bash
pnpm dev
# or
npm run dev
```

4. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

### Optional: Backend Setup

If you want to use the Python backend for algorithm processing:

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install Python dependencies**
```bash
pip install fastapi pydantic uvicorn
```

3. **Start the FastAPI server**
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at [http://localhost:8000](http://localhost:8000)

## 📁 Project Structure

```
algorithm-visualizer/
├── 📂 app/                          # Next.js App Router pages
│   ├── 📂 about/                    # About page
│   ├── 📂 visualizer/               # Alternative visualizer page
│   ├── 📄 globals.css               # Global styles
│   ├── 📄 layout.tsx                # Root layout component
│   ├── 📄 loading.tsx               # Loading UI component
│   └── 📄 page.tsx                  # Main homepage
├── 📂 backend/                      # FastAPI backend (optional)
│   └── 📄 main.py                   # Python algorithm implementations
├── 📂 components/                   # React components
│   ├── 📂 ui/                       # Radix UI component library
│   ├── 📂 visualization/            # Algorithm visualization components
│   │   ├── 📄 sorting-bars.tsx      # Bar chart visualizations
│   │   ├── 📄 sorting-blocks.tsx    # Number block visualizations
│   │   └── 📄 search-cells.tsx      # Search visualization cells
│   ├── 📄 live-process.tsx          # Real-time step logging
│   ├── 📄 step-log.tsx              # Step history component
│   └── 📄 theme-provider.tsx        # Theme management
├── 📂 lib/                          # Utility libraries
│   ├── 📄 algorithms.ts             # Core algorithm implementations
│   ├── 📄 algorithms-steps.ts       # Step generation logic
│   ├── 📄 steps.ts                  # Step type definitions
│   └── 📄 utils.ts                  # Utility functions
├── 📄 components.json               # Shadcn UI configuration
├── 📄 next.config.mjs               # Next.js configuration
├── 📄 package.json                  # Project dependencies
├── 📄 tailwind.config.ts            # Tailwind CSS configuration
└── 📄 tsconfig.json                 # TypeScript configuration
```

## 🎮 Usage Guide

### Basic Operations

1. **Choose Algorithm Mode**
   - Toggle between "Sorting" and "Searching" tabs
   - Select specific algorithm from dropdown

2. **Customize Visualization**
   - Adjust speed slider (0.1x to 1.5x)
   - Change array size (5 to 100 elements)
   - Switch between blocks and bars view (sorting only)

3. **Control Playback**
   - **Start** - Begin algorithm execution
   - **Pause/Resume** - Control animation playback
   - **Reset** - Clear progress and generate new array
   - **Randomize** - Generate new random array

### Searching Mode

1. Set target value in the input field
2. Array automatically sorts for binary/jump search
3. Watch as algorithm narrows down search space
4. View success/failure results with highlighting

### Live Metrics

Monitor real-time performance data:
- **Comparisons** - Element comparison operations
- **Swaps** - Element position exchanges  
- **Writes** - Array modification operations
- **Probes** - Search attempt counts
- **Elapsed Time** - Total execution duration

## 🧪 Algorithm Implementations

### Sorting Algorithms

| Algorithm | Time Complexity | Space | Stable | In-Place |
|-----------|----------------|-------|--------|----------|
| Bubble Sort | O(n²) avg/worst, O(n) best | O(1) | ✅ Yes | ✅ Yes |
| Selection Sort | O(n²) all cases | O(1) | ❌ No | ✅ Yes |
| Insertion Sort | O(n²) avg/worst, O(n) best | O(1) | ✅ Yes | ✅ Yes |
| Merge Sort | O(n log n) all cases | O(n) | ✅ Yes | ❌ No |
| Quick Sort | O(n log n) avg, O(n²) worst | O(log n) | ❌ No | ✅ Yes |

### Searching Algorithms

| Algorithm | Time Complexity | Space | Prerequisites |
|-----------|----------------|-------|---------------|
| Linear Search | O(n) avg/worst, O(1) best | O(1) | None |
| Binary Search | O(log n) avg/worst, O(1) best | O(1) | Sorted array |
| Jump Search | O(√n) all cases | O(1) | Sorted array |

## 🎨 Customization

### Adding New Algorithms

1. **Define algorithm in `lib/algorithms.ts`**:
```typescript
function stepsNewAlgorithm(src: number[]): StepEvent[] {
  const steps: StepEvent[] = [];
  // Implementation here
  return steps;
}
```

2. **Add to algorithm registry**:
```typescript
export const NEW_ALGOS = [
  { id: "newAlgo", label: "New Algorithm" },
] as const
```

3. **Add metadata**:
```typescript
export const algoMeta: Record<AlgorithmId, AlgorithmMeta> = {
  newAlgo: {
    label: "New Algorithm",
    description: "Description of the algorithm",
    complexity: { best: "O(?)", avg: "O(?)", worst: "O(?)" }
  }
}
```

### Theming and Styling

The project uses Tailwind CSS with a dark theme. Key design tokens:

- **Background**: `slate-950` (very dark)
- **Text**: `slate-200` (light gray)
- **Accents**: Various color scales for highlights
- **Components**: Glass-morphism with backdrop blur

Customize colors in `tailwind.config.ts` and component styles.

## 🔧 Configuration

### Environment Variables

Create `.env.local` for custom configuration:

```bash
# Optional: Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional: Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS=true
```

### Build Configuration

Key settings in `next.config.mjs`:
- ESLint and TypeScript error handling
- Image optimization settings
- Static export compatibility

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect repository to Vercel**
2. **Configure build settings**:
   - Build Command: `pnpm build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`

3. **Deploy automatically** on git push

### Alternative Platforms

- **Netlify**: Use `pnpm build && pnpm export`
- **GitHub Pages**: Configure static export
- **Docker**: Create Dockerfile for containerization

## 🤝 Contributing

We welcome contributions! Here's how to get involved:

### Development Workflow

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes** with proper TypeScript types
4. **Add tests** if applicable
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open Pull Request**

### Code Standards

- Use **TypeScript** for all new code
- Follow **ESLint** configuration
- Add **JSDoc** comments for complex functions
- Maintain **component prop types**
- Use **semantic commit messages**

### Bug Reports

When reporting bugs, please include:
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Console error messages

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[GSAP](https://greensock.com/)** for incredible animation capabilities
- **[Radix UI](https://www.radix-ui.com/)** for accessible component primitives  
- **[Tailwind CSS](https://tailwindcss.com/)** for rapid styling development
- **[Next.js](https://nextjs.org/)** team for the excellent React framework
- **Algorithm visualization** inspiration from various educational resources

## 🐛 Known Issues & Roadmap

### Current Limitations
- [ ] Mobile responsiveness needs improvement
- [ ] Limited algorithm selection 
- [ ] No algorithm comparison features
- [ ] Missing accessibility features
- [ ] No data structure visualizations

### Planned Features
- [ ] **More Algorithms**: Heap sort, radix sort, interpolation search
- [ ] **Data Structures**: Binary trees, graphs, hash tables  
- [ ] **Algorithm Racing**: Side-by-side performance comparison
- [ ] **Custom Arrays**: User-defined input arrays
- [ ] **Export Features**: Animation recording, step export
- [ ] **Educational Mode**: Detailed explanations and theory
- [ ] **Performance Analytics**: Detailed complexity analysis
- [ ] **Accessibility**: Screen reader support, keyboard navigation

## 📞 Support

Need help or have questions?

- 📧 **Email**: [your-email@example.com](mailto:abhishek23@gmail.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/AbhishekS04/visualizer/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/AbhishekS04/visualizer/discussions)

---

<div align="center">

**⭐ Star this repo if you found it helpful! ⭐**

Made with ❤️ using Next.js, TypeScript, and GSAP

</div>
