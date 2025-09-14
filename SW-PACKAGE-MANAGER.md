# Service Worker Package Manager

## Overview

A service worker-based package manager that dynamically loads and serves mod packages from mod.io on-demand. When a request is made for a package URL, it downloads the zip file and serves its contents through the service worker.

## User Story

Alex has a print-and-play board game PDF that she wants to digitize. She runs it through https://github.com/garbo-succus/cardcutter twice - once for the main cards, and once for the tokens which need a different cut config. This produces two ZIP files with potentially overlapping package names.

Alex wants to import both ZIPs into her game. She uploads the files through the editor, and the system (TBD - possibly through automerge) hosts them as packages:

```json
{
  "dependencies": {
    "@user/my-cards": "automerge:abc123#commit-xyz",
    "@user/my-tokens": "automerge:def456#commit-abc"
  },
  "templates": {},
  "children": [
    {
      "name": "card-deck",
      "template": "@user/my-cards/deck-template",
      "position": [0, 0, 0]
    },
    {
      "name": "player-tokens",
      "template": "@user/my-tokens/token-set",
      "position": [0.2, 0, 0]
    }
  ]
}
```

### Missing
* How are the assets in the package physically inserted into the gamestate?
* What should automerge file references look like? https://gist.github.com/neftaly/9d655aceca95ac0570af1a7ddd405442
* Should cardcutter produce unique package names to help prevent collision?

## User Story 2: Community Assets

Plant wants to add custom assets to their tabletop game, alongside a GS-made pawn token. They find a dice pack with wooden textures on mod.io. They want the wooden d20 to be half the normal size. 

### Process

In their game configuration, they define the dependencies and pieces that reference templates from the packages:

```json
{
  "dependencies": {
    "@modio/8312-5036106": "modio:8312-5036106",
    "@garbo-succus/tokens": "npm:@garbo-succus/tokens@^1.2.0"
  },
  "templates": {
    "d20": {
      "template": "@modio/8312-5036106/d20",
      "scale": [0.5, 0.5, 0.5]
    }
  },
  "children": [
    {
      "name": "player-die",
      "template": "d20",
      "position": [0, 0, 0]
    },
    {
      "name": "player-pawn",
      "template": "@garbo-succus/tokens/pawn",
      "position": [0.1, 0, 0]
    }
  ]
}
```

When Plant loads their game, their React components reference the assets using standard package paths:

```
useTexture('package:@modio/8312-5036106/wood-texture.png')
useGLTF('package:@modio/8312-5036106/d20-model.glb')
<img src='package:@garbo-succus/tokens/pawn_normals.png' />
```

The service worker intercepts these requests, downloading mod.io packages for `package:@modio/*` paths and serving regular npm packages for others.

```js
import normalize from 'normalize-path';

// Custom fetch handler in service worker
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Intercept package: protocol requests
  if (url.protocol === 'package:') {
    event.respondWith(handlePackageRequest(event.request));
    return;
  }

  // Let Serwist handle other requests
});

async function handlePackageRequest(request) {
  const url = new URL(request.url);
  const [provider, packageName, ...fileParts] = url.pathname.split('/').filter(Boolean);

  // Normalize only the file path within the package (treat package as root)
  const normalizedFilePath = normalize(fileParts.join('/') || '/');
  const safePath = `/${provider}/${packageName}/${normalizedFilePath}`;

  if (provider === '@modio') {
    return handleModioRequest(request, safePath);
  }
}

// Path normalization examples (package is treated as root):
// 'package:@modio/8312-5036106/assets/../textures/wood.png' → '/@modio/8312-5036106/textures/wood.png'
// 'package:@modio/8312-5036106/../../../escape.txt' → '/@modio/8312-5036106/escape.txt' (can't escape package)
```

### Supported Package Providers
- `modio:gameId-modId` - Latest version of a mod from mod.io
- `modio:gameId-modId#filename.zip` - Specific zip file from mod.io
- `automerge:docId#commit` - Automerge document (implementation TBD)

## Integration

### modio-registry Server
Uses the [modio-registry server](https://github.com/garbo-succus/modio-registry) which provides:
- **Package metadata**: `GET /{gameId-modId}` returns npm-compatible JSON with file versions
- **File downloads**: `GET /{gameId-modId}/-/{filename}` serves zip files
- **Future JWT support**: Will require JWTs for paid mods (paying players can issue JWTs)

#### Registry API Format
- Package names: `{gameId-modId}` (e.g., `8312-5036106`)
- Download URLs: `https://modio-registry.probability.nz/{gameId-modId}/-/{filename}`
- Metadata includes `dist-tags.latest` for latest version

## Architecture

### Storage Strategy
- **OPFS Storage**: Extract ZIP files to Origin Private File System in `/node_modules` structure
- **Memory Map**: `{ packagePath: opfsFilePath }` for quick lookups
- **Blob URLs**: Created on-demand from OPFS files when serving requests
- **Garbage Collection**: OPFS files cleaned up when packages unloaded


### Error Handling
- **401 Unauthorized**: Access token invalid/expired
- **404 Not Found**: Mod/file doesn't exist
- **503 Service Unavailable**: can't reach mod.io and cache not available

### Memory Management
- **OPFS-based**: ZIP contents extracted to persistent OPFS storage
- **On-demand blob creation**: Create blob URLs only when serving requests
- **Memory pressure handling**: Clean up unused OPFS files when storage quota approached
- **LRU eviction**: Least recently used packages removed first
- **Supports dynamic loading/unloading** without keeping ZIP contents in RAM

## Future Goals

### Offline Support 
- Cache zip files for offline availability using OPFS (Origin Private File System)

### Caching
- Extract ZIP contents to OPFS in `/node_modules` folder structure? or will this take up too much storage?
- Some way to pin modules
- On cache eviction, only pinned modules are kept
