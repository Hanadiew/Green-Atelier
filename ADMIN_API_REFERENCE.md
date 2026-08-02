# Admin Library API Reference

Complete reference for functions available in `src/lib/admin.js`

## Authorization

### `getCurrentStaffRole()`
Returns the current user's role from `user_roles` table.
- **Returns**: `'admin'` | `'moderator'` | `null`
- **Usage**: Check authorization before rendering admin pages

```javascript
const role = await getCurrentStaffRole()
if (!role) redirect to home
```

### `isStaffMember()`
Checks if current user is admin or moderator.
- **Returns**: `boolean`

### `isAdmin()`
Checks if current user is admin (not moderator).
- **Returns**: `boolean`

### `isModerator()`
Checks if current user is admin or moderator.
- **Returns**: `boolean`

---

## Dashboard

### `getDashboardStats()`
Fetches all dashboard statistics.
- **Returns**: `object`
  ```javascript
  {
    totalUsers: number,
    activeListings: number,
    pendingListings: number,
    totalOrders: number,
    pendingReports: number,
    totalSales: number,        // RM
    platformCommission: number  // RM
  }
  ```

---

## Listings Management

### `getAdminListings(options)`
Fetches paginated list of listings for admin review.

**Options:**
```javascript
{
  status: 'pending_review' | 'active' | 'sold' | 'rejected' | null,
  search: string,
  brand: string | null,
  category: string | null,
  page: number (default: 1),
  perPage: number (default: 20)
}
```

**Returns:**
```javascript
{
  listings: [
    {
      id, title, brand, category, condition,
      price, originalPrice, image,
      status, createdAt, updatedAt,
      seller: { id, username, fullName, avatar },
      trustcheck: { score, status } | null
    }
  ],
  total: number  // total count before pagination
}
```

### `getAdminListing(listingId)`
Fetches complete details for a single listing.
- **Parameter**: `listingId` (uuid string)
- **Returns**: Listing object with additional verification details
- **Throws**: Error if listing not found

### `approveListing(listingId)`
Marks a pending listing as active (publishes it).
- **Parameter**: `listingId` (uuid string)
- **Throws**: Error if not authorized or listing not found

### `rejectListing(listingId, reason)`
Marks a pending listing as rejected.
- **Parameters**:
  - `listingId` (uuid string)
  - `reason` (optional string) - deprecation note: reason field not yet in schema
- **Throws**: Error if not authorized or listing not found

---

## Users Management

### `getAdminUsers(options)`
Fetches paginated list of users.

**Options:**
```javascript
{
  search: string,  // searches username and full_name
  page: number (default: 1),
  perPage: number (default: 20)
}
```

**Returns:**
```javascript
{
  users: [
    {
      id, username, fullName, avatar,
      email, location, isTrustedSeller,
      createdAt
    }
  ],
  total: number
}
```

### `getAdminUser(userId)`
Fetches detailed user information with stats.
- **Parameter**: `userId` (uuid string)
- **Returns**: User object with stats from `profile_stats` view
  ```javascript
  {
    ...user fields,
    stats: {
      listingCount: number,
      salesCount: number,
      purchaseCount: number
    }
  }
  ```

---

## Orders Management

### `getAdminOrders(options)`
Fetches paginated list of orders.

**Options:**
```javascript
{
  page: number (default: 1),
  perPage: number (default: 20)
}
```

**Returns:**
```javascript
{
  orders: [
    {
      id, orderNumber,
      buyer: { id, username, fullName, avatar },
      subtotal, shippingFee, serviceFee, discount, total,
      status, paymentStatus, placedAt,
      items: [
        {
          id, sellerId,
          title, brand, image,
          pricePaid, platformFee, sellerPayout,
          status
        }
      ]
    }
  ],
  total: number
}
```

### `getAdminOrder(orderId)`
Fetches complete order details.
- **Parameter**: `orderId` (uuid string)
- **Returns**: Order object with full details

---

## Reports Management

### `getReports(options)`
Fetches paginated list of reports.

**Options:**
```javascript
{
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed' | null,
  page: number (default: 1),
  perPage: number (default: 20)
}
```

**Returns:**
```javascript
{
  reports: [
    {
      id,
      reporter: { id, username, fullName, avatar },
      reportedListing: { id, title, brand, image } | null,
      reportedUser: { id, username, fullName, avatar } | null,
      reason: 'misleading_info' | 'policy_violation' | ...,
      description: string,
      status, adminNotes, handledById,
      createdAt, updatedAt
    }
  ],
  total: number
}
```

### `getReport(reportId)`
Fetches single report with full details.
- **Parameter**: `reportId` (uuid string)
- **Returns**: Report object

### `createReport(options)`
Creates a new report (user-facing, anyone can call).

**Options:**
```javascript
{
  reportedListingId: uuid | null,
  reportedUserId: uuid | null,
  reason: string (required),
  description: string (optional)
}
```

### `updateReportStatus(reportId, status, adminNotes)`
Updates report status and adds admin notes.
- **Parameters**:
  - `reportId` (uuid string)
  - `status` ('pending' | 'investigating' | 'resolved' | 'dismissed')
  - `adminNotes` (optional string)
- **Updates**: Sets `handled_by_id` to current user

---

## TrustCheck Management

### `getTrustCheckAssessments(options)`
Fetches paginated list of TrustCheck assessments.

**Options:**
```javascript
{
  status: 'likely_consistent' | 'needs_review' | 'insufficient_evidence' | null,
  page: number (default: 1),
  perPage: number (default: 20)
}
```

**Returns:**
```javascript
{
  assessments: [
    {
      listingId,
      listing: { id, title, brand, image, sellerId },
      score: number (0-100),
      status: string,
      evidence: {
        hasFront, hasBack, hasInterior,
        hasReceipt, hasSerial, hasCertificate,
        ocrOriginMatch
      },
      reference: { slug, brand, model, country },
      verification: {
        ocrText, receiptPath,
        certificatePath, serialImagePath
      }
    }
  ],
  total: number
}
```

### `getTrustCheckAssessment(listingId)`
Fetches TrustCheck details for a specific listing.
- **Parameter**: `listingId` (uuid string)
- **Returns**: Assessment object
- **Note**: Score is server-computed and read-only from admin portal

---

## Brands Management

### `getAdminBrands(options)`
Fetches paginated list of brands.

**Options:**
```javascript
{
  search: string,
  page: number (default: 1),
  perPage: number (default: 20)
}
```

**Returns:**
```javascript
{
  brands: [
    {
      id, name, slug,
      logo_url, is_active,
      created_at
    }
  ],
  total: number
}
```

### `createBrand(name, slug, logoUrl)`
Creates a new brand.
- **Parameters**:
  - `name` (string, required)
  - `slug` (string, required, unique)
  - `logoUrl` (string, optional)
- **Throws**: Error if name/slug already exists

### `updateBrand(brandId, updates)`
Updates brand properties.
- **Parameters**:
  - `brandId` (uuid string)
  - `updates` (object with any brand columns)
- **Example**: `updateBrand(id, { is_active: false })`

---

## Featured Listings Management

### `getFeaturedListings()`
Gets all featured listings in position order.
- **Returns**:
```javascript
[
  {
    id,
    listingId,
    position: number,
    listing: {
      id, title, brand, image,
      price, sellerId
    }
  }
]
```

### `addFeaturedListing(listingId, position)`
Adds a listing to featured.
- **Parameters**:
  - `listingId` (uuid string)
  - `position` (number, default 0)
- **Note**: Only works for active listings (enforced by RLS)

### `removeFeaturedListing(listingId)`
Removes a listing from featured.
- **Parameter**: `listingId` (uuid string)

### `updateFeaturedListingsOrder(updates)`
Reorders featured listings.
- **Parameter**: `updates` array
  ```javascript
  [
    { id: featured-id-1, position: 0 },
    { id: featured-id-2, position: 1 }
  ]
  ```

---

## Promo Codes Management

### `getPromoCodes(options)`
Fetches paginated promo codes.

**Options:**
```javascript
{
  page: number (default: 1),
  perPage: number (default: 20)
}
```

**Returns:**
```javascript
{
  codes: [
    {
      code, discountType,
      discountAmount, minSpend,
      expiresAt, usageLimit, usageCount,
      isActive, createdAt
    }
  ],
  total: number
}
```

### `createPromoCode(promoData)`
Creates a new promo code.
- **Parameter**: `promoData` (object)
  ```javascript
  {
    code: string,
    discount_type: 'percentage' | 'fixed',
    discount_amount: number,
    minimum_spend: number,
    expires_at: timestamp,
    usage_limit: number,
    is_active: boolean
  }
  ```

### `updatePromoCode(code, updates)`
Updates promo code properties.
- **Parameters**:
  - `code` (string, the code identifier)
  - `updates` (object with any columns to update)

---

## Contact Messages Management

### `getContactMessages(options)`
Fetches paginated contact messages.

**Options:**
```javascript
{
  page: number (default: 1),
  perPage: number (default: 20)
}
```

**Returns:**
```javascript
{
  messages: [
    {
      id, name, email, subject, message,
      created_at, is_read
    }
  ],
  total: number
}
```

### `getContactMessage(messageId)`
Fetches complete message details.
- **Parameter**: `messageId` (uuid string)
- **Returns**: Message object

### `markMessageAsRead(messageId)`
Marks a contact message as read.
- **Parameter**: `messageId` (uuid string)

---

## Error Handling

All functions throw errors when they fail. Catch them in your Vue components:

```javascript
try {
  const data = await getAdminListings()
  listings.value = data.listings
} catch (err) {
  error.value = err.message
  console.error(err)
}
```

Common errors:
- **"Failed to load..."** - Usually a Supabase RLS or connection error
- **"Not found"** - Resource doesn't exist
- **Authorization errors** - User doesn't have permission

---

## Usage Examples

### Fetch and display pending listings

```javascript
import { getAdminListings } from '../../lib/admin.js'

const listings = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const { listings: data } = await getAdminListings({ status: 'pending_review' })
    listings.value = data
  } finally {
    loading.value = false
  }
})
```

### Approve a listing

```javascript
import { approveListing } from '../../lib/admin.js'

async function handleApprove(listingId) {
  try {
    await approveListing(listingId)
    // Refresh list or update local state
  } catch (err) {
    console.error('Approval failed:', err)
  }
}
```

### Get dashboard statistics

```javascript
import { getDashboardStats } from '../../lib/admin.js'

const stats = ref({})

onMounted(async () => {
  stats.value = await getDashboardStats()
})
```

---

## Notes

- All functions use the **anon key** + **RLS** for security
- Role checks happen at the database level (more secure than client-side)
- Pagination defaults to 20 items per page
- All timestamps are ISO 8601 format
- Monetary values are numbers (RM) unless specified otherwise
- **Never log sensitive data** like passwords or auth tokens
