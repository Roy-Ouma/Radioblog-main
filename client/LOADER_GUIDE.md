# Client Loader Implementation Guide

## Overview
The client now has a professional, transparent loader that works globally across all pages. The loader appears as a semi-transparent overlay with a branded "Maseno Radio" logo and animated bars.

## Features
- **Global**: Managed from central Zustand store (`store/index.js`)
- **Transparent**: Uses `backdrop-blur-sm` for modern UI effect
- **Dark mode**: Automatically adapts to light/dark theme
- **Professional**: Smooth animations with gradient bars
- **Non-blocking**: Overlay doesn't prevent user interactions when needed

## How It Works

### 1. **Automatic Global Loader** (No Code Required)
The loader automatically appears whenever `store.isLoading` is `true`. It's rendered at the root level in `App.js` and overlays all content.

```jsx
// In App.js - automatic
{isLoading && <Loading />}
```

### 2. **Using the `useLoader` Hook** (Recommended)
Import and use the custom hook in any component to manage loading state:

```jsx
import { useLoader } from "../hooks/useLoader";

function MyComponent() {
  const { withLoader, isLoading, setIsLoading } = useLoader();

  const handleSubmit = async () => {
    await withLoader(async () => {
      // Your async code here - loader shows automatically
      await someAsyncOperation();
    });
  };

  return (
    <div>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
```

### 3. **Manual Control** (Direct Store Access)
If you need fine-grained control:

```jsx
import useStore from "../store";

function MyComponent() {
  const { setIsLoading } = useStore();

  const handleAction = async () => {
    setIsLoading(true);
    try {
      await myAsyncTask();
    } finally {
      setIsLoading(false);
    }
  };

  return <button onClick={handleAction}>Do Something</button>;
}
```

## Common Use Cases

### Sign-Up / Sign-In
```jsx
const { withLoader } = useLoader();

const handleSubmit = async (e) => {
  e.preventDefault();
  await withLoader(async () => {
    const result = await emailSignUp({ ...Data, image: imageUrl });
    if (result?.success) saveUserInfo(result, signIn);
  });
};
```

### Fetching Data
```jsx
const { withLoader } = useLoader();

useEffect(() => {
  (async () => {
    await withLoader(async () => {
      const response = await fetchUserProfile(userId);
      setUser(response);
    });
  })();
}, [userId]);
```

### Image Upload
```jsx
const { withLoader } = useLoader();

const handleImageUpload = async (file) => {
  await withLoader(async () => {
    const url = await uploadFile(file);
    setImageUrl(url);
  });
};
```

### Google OAuth
```jsx
const { withLoader } = useLoader();

const googleLogin = useGoogleLogin({
  onSuccess: async (tokenResponse) => {
    await withLoader(async () => {
      const userResp = await getGoogleSignUp(tokenResponse?.access_token);
      signIn(userResp);
    });
  },
});
```

## Customization

### Change Loader Style
Edit `client/src/components/Loading.jsx`:
- Modify backdrop color: Change `bg-black/30` or `bg-black/50` to any color
- Modify animation: Edit the `@keyframes bounce` CSS
- Change logo text: Update the text in the component
- Adjust opacity: Change `backdrop-blur-sm` for more/less blur

### Disable Loader Temporarily
```jsx
// Temporarily skip loading state
const result = await fetch(...); // no loader
```

### Show Custom Message
You can extend the loader to accept a message prop:
```jsx
{isLoading && <Loading message="Processing your request..." />}
```

## Performance Tips
- The loader uses CSS animations (GPU-accelerated) - very performant
- It's only rendered when `isLoading` is `true` (conditional rendering)
- The `backdrop-blur-sm` effect is hardware-accelerated on modern browsers
- No polling or interval-based updates - purely state-driven

## Browser Compatibility
- Works on all modern browsers (Chrome, Firefox, Safari, Edge)
- `backdrop-blur` supported on modern browsers; gracefully degrades to solid background on older browsers

## Files Modified
- `client/src/components/Loading.jsx` - Enhanced with modern design and animations
- `client/src/App.js` - Cleaned up to use the global loader
- `client/src/hooks/useLoader.js` - New custom hook for easy integration

## Next Steps
1. Use `useLoader` hook in any component that performs async operations
2. The loader will automatically show and hide based on the operation duration
3. Test across different pages to ensure smooth experience
