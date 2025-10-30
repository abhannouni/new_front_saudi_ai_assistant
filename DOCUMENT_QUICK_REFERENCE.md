# Document System Quick Reference

## Import the Hook
```javascript
import { useDocument } from './hooks/useDocument';
```

## Basic Usage
```javascript
const {
  documents,        // Array of documents (filtered by searchQuery)
  loading,          // Loading state
  error,            // Error message
  pagination,       // { currentPage, totalPages, totalCount, hasNext, hasPrev }
  filters,          // { sortBy, sortOrder, filterType, limit, showFavorites, hasActiveFilters }
  
  // Actions
  loadDocuments,
  toggleFavorite,
  createChat
} = useDocument(true); // true = auto-load on mount
```

---

## Common Operations

### Load Documents
```javascript
// Load with default params
loadDocuments();

// Load with custom params
loadDocuments({
  page: 1,
  limit: 20,
  sortBy: 'lastUsed',
  sortOrder: 'desc',
  documentType: 'contract',
  favorites: true
});
```

### Toggle Favorite
```javascript
await toggleFavorite('document-id-123');
// State automatically updates
```

### Create Chat
```javascript
const result = await createChat('document-id-123');
console.log(result.payload.chatId);
// Navigate to: /chat/${result.payload.chatId}
```

### Change Sort
```javascript
changeSortBy('lastUsed');      // or 'createdAt', 'originalName', 'totalInteractions'
changeSortOrder('desc');        // or 'asc'
toggleSortOrder();              // Toggle between asc/desc
```

### Filter Documents
```javascript
changeFilterType('contract');   // or 'agreement', 'court', 'license', etc.
toggleFavoritesFilter();        // Show only favorites
setFavoritesFilter(true);       // Set favorites filter directly
```

### Navigate Pages
```javascript
goToPage(5);           // Go to page 5
nextPage();            // Go to next page
prevPage();            // Go to previous page
firstPage();           // Go to first page
lastPage();            // Go to last page
```

### Search
```javascript
updateSearchQuery('my document');
// documents array is automatically filtered
```

### View Mode
```javascript
changeViewMode('grid');    // or 'list'
toggleViewMode();          // Toggle between grid and list
```

### Reset
```javascript
resetFilters();  // Reset all filters to default
```

---

## State Properties

### Documents
- `documents` - Filtered documents (by searchQuery)
- `allDocuments` - All documents (unfiltered)

### Loading States
- `loading` - Main loading state
- `uploading` - Upload in progress
- `loadingDocumentChats` - Loading chats

### Pagination
- `pagination.currentPage` - Current page number
- `pagination.totalPages` - Total pages
- `pagination.totalCount` - Total document count
- `pagination.hasNext` - Has next page
- `pagination.hasPrev` - Has previous page

### Filters
- `filters.sortBy` - Current sort field
- `filters.sortOrder` - Current sort direction
- `filters.filterType` - Current document type filter
- `filters.limit` - Items per page
- `filters.showFavorites` - Showing only favorites
- `filters.hasActiveFilters` - Any filters active

### Selected Document
- `selectedDocument` - Currently selected document
- `selectedDocumentChats` - Chats for selected document

### UI
- `viewMode` - Current view mode ('grid' or 'list')
- `searchQuery` - Current search query
- `error` - Error message

---

## Sort Fields

| Field | Description |
|-------|-------------|
| `lastUsed` | Last interaction date (default) |
| `createdAt` | Upload date |
| `originalName` | File name (A-Z) |
| `totalInteractions` | Usage count |

---

## Document Types

| Type | Use Case |
|------|----------|
| `contract` | Business contracts |
| `agreement` | Legal agreements |
| `court` | Court filings |
| `license` | Licenses and permits |
| `legal_memo` | Legal memos |
| `power_of_attorney` | Power of attorney |
| `regulation` | Regulations |
| `commercial` | Commercial documents |
| `other` | Miscellaneous |

---

## Document Object Structure

```javascript
{
  _id: string,
  originalName: string,
  storedFileName: string,
  fileType: string,
  fileSize: number,
  documentType: string,
  uploadDate: string,
  lastUsed: string,
  isFavorite: boolean,
  tags: Array<string>,
  usage: {
    viewCount: number,
    chatCount: number,
    totalInteractions: number
  },
  metadata: Object
}
```

---

## Complete Example

```javascript
import React from 'react';
import { useDocument } from './hooks/useDocument';

const DocumentList = () => {
  const {
    documents,
    loading,
    error,
    pagination,
    filters,
    viewMode,
    
    toggleFavorite,
    createChat,
    changeSortBy,
    changeFilterType,
    toggleViewMode,
    updateSearchQuery,
    goToPage,
    dismissError
  } = useDocument(true);
  
  if (loading && documents.length === 0) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      {/* Search */}
      <input
        type="search"
        placeholder="Search..."
        onChange={(e) => updateSearchQuery(e.target.value)}
      />
      
      {/* Controls */}
      <div>
        <select onChange={(e) => changeSortBy(e.target.value)} value={filters.sortBy}>
          <option value="lastUsed">Last Used</option>
          <option value="createdAt">Upload Date</option>
          <option value="originalName">Name</option>
        </select>
        
        <select onChange={(e) => changeFilterType(e.target.value)} value={filters.filterType}>
          <option value="">All Types</option>
          <option value="contract">Contract</option>
          <option value="agreement">Agreement</option>
        </select>
        
        <button onClick={toggleViewMode}>
          {viewMode === 'grid' ? 'List View' : 'Grid View'}
        </button>
      </div>
      
      {/* Error */}
      {error && (
        <div className="error">
          {error}
          <button onClick={dismissError}>×</button>
        </div>
      )}
      
      {/* Documents */}
      <div className={viewMode}>
        {documents.map(doc => (
          <div key={doc._id}>
            <h3>{doc.originalName}</h3>
            <button onClick={() => toggleFavorite(doc._id)}>
              {doc.isFavorite ? '★' : '☆'}
            </button>
            <button onClick={() => createChat(doc._id)}>
              Chat
            </button>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      <div>
        <button onClick={() => goToPage(pagination.currentPage - 1)} disabled={!pagination.hasPrev}>
          Prev
        </button>
        <span>Page {pagination.currentPage} / {pagination.totalPages}</span>
        <button onClick={() => goToPage(pagination.currentPage + 1)} disabled={!pagination.hasNext}>
          Next
        </button>
      </div>
    </div>
  );
};
```

---

## API Response Format

### Success
```javascript
{
  success: true,
  data: {
    documents: [...],
    pagination: {
      currentPage: 1,
      totalPages: 5,
      totalCount: 97,
      hasNext: true,
      hasPrev: false
    }
  }
}
```

### Error
```javascript
{
  success: false,
  message: "Error message"
}
```

---

## Tips

1. **Auto-load**: Use `useDocument(true)` to load on mount
2. **Error handling**: Always show and dismiss errors
3. **Loading states**: Show spinners during async operations
4. **Optimistic updates**: Favorite toggle updates immediately
5. **URL sync**: Sync pagination with URL params for sharing
6. **Debounce search**: Debounce search input for better performance

---

**Quick Start Checklist**
- ✅ Import `useDocument` hook
- ✅ Enable auto-load with `true` parameter
- ✅ Display documents array
- ✅ Add pagination controls
- ✅ Add filter/sort controls
- ✅ Handle errors with dismiss
- ✅ Show loading states
- ✅ Test favorite toggle
- ✅ Test chat creation
