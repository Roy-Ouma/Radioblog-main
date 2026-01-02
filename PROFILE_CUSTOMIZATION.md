# Profile Customization Feature

## Overview
Writers in the Admin panel can now customize their public author identity while maintaining Google-only authentication. This feature allows writers to set a preferred author name and upload a custom profile picture that appear on published articles and author cards.

## Features Implemented

### 1. Database Schema Updates
**User Model** (`server/models/UserModel.js`):
- Added `author_name` (string, nullable): Custom author display name
- Added `author_avatar_url` (string, nullable): Custom author profile picture URL

These fields are **independent of authentication fields** - Google OAuth remains completely unchanged.

### 2. Backend Updates

#### API Endpoint
**PATCH /users/update** (existing endpoint, enhanced)
- Route: `server/routes/userRoute.js` (already configured)
- Controller: `server/controllers/userController.js`
- Authentication: Required (writers can update their own, admins can update others)
- Accepts new fields:
  - `author_name` (string or null)
  - `author_avatar_url` (string or null)

#### Authorization
- Writers can only update their own profile
- Admins can update any user's profile (via `/users/update/:id` with adminAuth)
- Backend validates authorization at middleware level

### 3. Frontend Implementation

#### Profile Page
**Location**: `admin/src/pages/Profile.jsx`
- Accessible via `/admin/profile` route
- Displays current profile information
- Shows live preview of changes
- Two input fields:
  1. **Author Display Name**: Text input (required when saving)
  2. **Author Profile Picture**: File upload with preview

#### Features:
- **Image Upload**:
  - Accepts: JPG, PNG, WebP
  - Max size: 5MB
  - Shows preview before saving
  - Option to remove custom image (reverts to Google avatar)

- **Author Name**:
  - Can leave empty to use Google name
  - Validates required field on save
  - Shows preview with current selection

- **Current Profile Overview**:
  - Displays live preview of how profile will appear
  - Shows both Google defaults and custom overrides

#### Menu Integration
**Navbar Update** (`admin/src/components/Navbar.jsx`):
- Added Profile link in user dropdown menu
- Navigates to `/profile` page

#### Routes
**App.js**:
- Added route: `<Route path='/profile' element={<Profile />} />`
- Profile page accessible after authentication

### 4. Utility Functions

**New Helpers** (`admin/src/utils/index.js`):
```javascript
getAuthorName(user)           // Returns author_name or falls back to name
getAuthorAvatar(user)         // Returns author_avatar_url or falls back to image
getAuthorProfile(user)        // Returns { name, avatar } object
```

These should be used throughout the app where author info is displayed (articles, author cards, etc.).

## Display Logic

### Author Name
```
if user.author_name exists → display it
else → display user.name (from Google)
```

### Author Avatar
```
if user.author_avatar_url exists → display it
else → display user.image (from Google)
```

## Data Persistence

- Changes are saved to MongoDB (UserModel)
- JWT token refreshed on save
- User state updated in localStorage
- Persists across sessions and page refreshes

## Security Considerations

✅ **Authentication Not Affected**:
- Google OAuth remains the only auth method
- No password fields touched
- No session/token changes

✅ **Authorization Enforced**:
- Writers can only update their own profile
- Admins can update any profile
- Backend validates all requests

✅ **File Upload Safety**:
- File type validation (JPG, PNG, WebP only)
- File size limits (5MB max)
- Uploaded via existing server endpoint
- Stores only URL, not raw file data

## Usage for Writers

1. Click profile picture in navbar → "Profile"
2. Set preferred "Author Display Name"
3. Upload custom profile picture (optional)
4. Click "Save Profile"
5. Changes appear on all published articles and author cards

## Usage for Developers

### To Display Author Info:
```javascript
import { getAuthorProfile } from '../utils';

const author = getAuthorProfile(user);
// author.name = custom or Google name
// author.avatar = custom or Google avatar
```

### To Update Author Info (from backend):
```javascript
// API call to PATCH /users/update with:
{
  author_name: "New Author Name",
  author_avatar_url: "https://..." // or null to clear
}
```

## Notes

- Profile customization is **writer-facing only** - not available in client app
- Google OAuth integration remains completely unchanged
- No duplicate user records or auth-related changes
- Image storage uses existing upload endpoint
- Database backward compatible (new fields are nullable)

## Testing Checklist

- [ ] Writer can access profile page
- [ ] Writer can set custom author name
- [ ] Writer can upload custom profile picture
- [ ] Profile picture preview updates correctly
- [ ] Changes persist after page refresh
- [ ] Admin can edit other writers' profiles
- [ ] Google OAuth still works unchanged
- [ ] Can remove custom image to revert to Google avatar
- [ ] File upload validation works (size, type)
- [ ] Unauthorized users cannot access other profiles
