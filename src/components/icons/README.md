# Icon Components

This project now uses [@vicons](https://www.xicons.org/) for all icons instead of custom SVG components.

## Available Icon Libraries

The following icon libraries are installed and available:

- `@vicons/fluent` - Microsoft Fluent UI icons (Primary choice)
- `@vicons/ionicons5` - Ionicons 5 icons
- `@vicons/material` - Material Design icons
- `@vicons/antd` - Ant Design icons
- `@vicons/carbon` - IBM Carbon icons

## Usage Examples

### Basic Usage

```vue
<template>
  <n-icon>
    <Search20Regular />
  </n-icon>
</template>

<script setup>
import { Search20Regular } from "@vicons/fluent";
</script>
```

### With Size and Color

```vue
<template>
  <n-icon size="24" color="#2563eb">
    <Settings20Regular />
  </n-icon>
</template>

<script setup>
import { Settings20Regular } from "@vicons/fluent";
</script>
```

### In Menu Options (for sidebar, dropdowns, etc.)

```vue
<script setup>
import { h } from "vue";
import { NIcon } from "naive-ui";
import { Dashboard20Regular } from "@vicons/fluent";

const menuOptions = [
  {
    label: "Dashboard",
    key: "dashboard",
    icon: () => h(NIcon, null, { default: () => h(Dashboard20Regular) }),
  },
];
</script>
```

## Icon Selection Guidelines

1. **Primary Choice**: Use `@vicons/fluent` for consistency with the modern design
2. **Naming Convention**: Most Fluent icons follow the pattern `[Name][Size][Variant]`
   - Size: Usually `20Regular`, `24Regular`, etc.
   - Variant: `Regular`, `Filled`, `Light`
3. **Fallback**: If an icon doesn't exist in Fluent, use `@vicons/material` or `@vicons/ionicons5`

## Common Icons Used in FrameSaga

### Navigation

- `Dashboard20Regular` - Dashboard/home
- `Image20Regular` - Photo Hub
- `FolderOpen20Regular` - Collections
- `Search20Regular` - Search
- `Canvas20Regular` - Canvas
- `ImageMultiple20Regular` - Curation
- `Grid320Regular` - Grids

### Actions

- `Add20Regular` - Add/plus
- `Delete20Regular` - Delete/trash
- `Edit20Regular` - Edit
- `Share20Regular` - Share
- `Download20Regular` - Download
- `Upload20Regular` - Upload

### Interface

- `Settings20Regular` - Settings
- `QuestionCircle20Regular` - Help
- `Alert20Regular` - Notifications
- `CheckmarkCircle20Filled` - Success/check
- `Warning20Regular` - Warning
- `Info20Regular` - Information

### User

- `Person20Regular` - User/profile
- `SignOut20Regular` - Logout
- `Camera20Regular` - Camera/photos

## Migration Notes

Old custom SVG icon components have been removed and replaced with @vicons.
If you need to add new icons, use the @vicons library instead of creating custom SVG components.

Visit [xicons.org](https://www.xicons.org/) to browse and search for available icons.
