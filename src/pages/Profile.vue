<template>
  <div class="page-shell">
    <Navbar />

    <div class="page-top page-container pb-16">

      <!-- Listing submitted confirmation -->
      <Transition name="banner">
      <div v-if="justSubmitted" class="mb-6 rounded-lg px-5 py-4 flex items-start gap-3" style="background-color: #E8F5EE;">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        <div>
          <p class="text-sm font-medium text-gray-800 mb-0.5">Listing submitted for review</p>
          <p class="text-xs text-gray-500">
            Our team will check it over. Once approved it appears in the shop. Until then
            you will find it below, marked "In review".
          </p>
        </div>
      </div>
      </Transition>

      <!-- Error -->
      <div v-if="errorMsg" class="mb-6 rounded-lg px-5 py-4 text-xs" style="background-color: #FEF2F2; color: #B91C1C;">
        {{ errorMsg }}
      </div>

      <!-- ===== PROFILE HEADER ===== -->
      <!-- No bottom rule. The tab pill below is a self-contained control with
           its own edge, so a full-width line between them read as a divider
           belonging to nothing. -->
      <div class="py-10 flex items-center justify-between flex-wrap gap-8">

        <div class="flex items-center gap-8">
          <!-- Avatar -->
          <div class="relative">
            <div class="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
              <img v-if="user.avatar" :src="user.avatar" class="w-full h-full object-cover" />
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M5.121 17.804A8.966 8.966 0 0112 15c2.21 0 4.232.797 5.879 2.11M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
          </div>

          <!-- Info -->
          <div>
            <h1 class="text-xl font-semibold text-gray-800 mb-0.5">{{ user.firstName }} {{ user.lastName }}</h1>
            <p class="text-xs text-gray-400 mb-2">@{{ user.username }}</p>
            <div class="flex items-center gap-1 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <p class="text-xs text-gray-400">{{ user.state }}, Malaysia</p>
            </div>
            <div class="flex items-center gap-4 mt-2">
              <p class="text-xs text-gray-500"><span class="font-medium text-gray-700">{{ stats.itemsForSale }}</span> items for sale</p>
              <p class="text-xs text-gray-500"><span class="font-medium text-gray-700">{{ stats.sold }}</span> sold</p>
            </div>
            <button v-if="!isOwnProfile && profileRow?.id" @click="handleReport"
              class="text-xs text-gray-400 hover:text-red-600 transition mt-3">
              Report this user
            </button>
          </div>
        </div>

        <!-- ===== SELLER OVERVIEW ===== -->
        <!-- Owner-only, and only once the seller has at least one listing or
             sale — a brand-new buyer-only account never sees this. -->
        <div v-if="isOwnProfile && isSeller" class="w-full lg:w-[260px] lg:flex-shrink-0">
          <p class="text-xs tracking-widest uppercase text-gray-400 mb-3">Seller Overview</p>

          <!-- Items Sold and Active Listings were removed: both are already stated
               under the profile name above, so the panel was repeating itself. The
               whole card is now the link to Wallet — a bigger target than the old
               text link underneath it, and it keeps the action inside the card. -->
          <RouterLink to="/wallet"
            class="block bg-white rounded-xl shadow-sm px-5 py-4 transition hover:shadow-md group">
            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0">
                <p class="text-xs text-gray-400 mb-0.5">Total Earnings</p>
                <p class="text-lg font-semibold text-gray-800">
                  RM {{ earnings.totalEarnings.toLocaleString() }}.00
                </p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 flex-shrink-0 transition-transform group-hover:translate-x-0.5"
                style="color: #C9A96E;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>

            <div class="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-gray-100">
              <p class="text-xs text-gray-400">Paid Out</p>
              <p class="text-xs font-medium text-gray-700">
                RM {{ earnings.paidOut.toLocaleString() }}.00
              </p>
            </div>
          </RouterLink>
        </div>

      </div>

      <!-- ===== TABS =====
           A segmented control rather than an underline row. The underline sat on
           a full-width rule that ran the width of the page with nothing under
           its right-hand two thirds, so the row read as a page divider that
           happened to have words on the left. This is a self-contained control:
           it ends where the tabs end, and the selected one is a filled pill
           rather than a 2px line.

           Each tab carries its count, so you can see whether a section is worth
           opening before you open it. The count is omitted rather than shown as
           0, which would read as an error state. -->
      <div role="tablist" aria-label="Profile sections"
        class="inline-flex items-center gap-1 p-1 rounded-full overflow-x-auto no-scrollbar max-w-full"
        style="background-color: #F2F0EB;">
        <button v-for="tab in visibleTabs" :key="tab"
          type="button" role="tab" :aria-selected="activeTab === tab"
          class="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full text-sm whitespace-nowrap transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C9A96E]"
          :class="activeTab === tab
            ? 'bg-white text-gray-900'
            : 'text-gray-500 hover:text-gray-800'"
          style="--tw-ring-offset-color: #F2F0EB;"
          @click="activeTab = tab">
          {{ tab }}
          <span v-if="tabCount(tab)" class="text-xs tabular-nums"
            :class="activeTab === tab ? 'text-gray-400' : 'text-gray-400'">
            {{ tabCount(tab) }}
          </span>
        </button>
      </div>

      
    <!-- ===== TAB CONTENT ===== -->
<div class="pt-10">

  <!-- ===== LISTINGS TAB ===== -->
  <div v-if="activeTab === 'Listings'">

    <!-- Hidden entirely when there is nothing to list: the empty state below
         carries its own Add Item button, and two of them read as a mistake. -->
    <div v-if="listings.length > 0" class="flex items-center justify-between gap-4 mb-6 flex-wrap">
  <RouterLink v-if="isOwnProfile" to="/sell"
    class="px-5 py-2 text-xs  rounded-md transition flex items-center gap-1.5 flex-shrink-0 btn-solid">
    <span class="text-sm leading-none">+</span> Add Item
  </RouterLink>

  <!-- Each control is one pill carrying its own label, the way the Shop page's
       Filters button does. The label used to float outside the box, so the row
       read as six loose elements rather than three controls. -->
  <div v-if="listings.length > 0" class="flex items-center gap-3 ml-auto flex-wrap">
    <label class="control-pill">
      <span class="control-pill__label">Filter</span>
      <select v-model="listingFilter" class="control-pill__value">
        <option value="all">All</option>
        <option value="tops">Tops</option>
        <option value="bottoms">Bottoms</option>
        <option value="bags">Bags</option>
        <option value="shoes">Shoes</option>
        <option value="accessories">Accessories</option>
      </select>
    </label>

    <label class="control-pill">
      <span class="control-pill__label">Sort</span>
      <select v-model="listingSort" class="control-pill__value">
        <option value="latest">Latest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </label>

    <!-- Owner only. A visitor browsing someone else's profile has no use for
         a switch that reveals items they cannot buy, and sold stock is not
         theirs to page through. -->
    <span v-if="isOwnProfile" class="control-pill">
      <span class="control-pill__label">Sold items</span>
      <ToggleSwitch v-model="showSold" size="sm" />
    </span>
  </div>
</div>

    <!-- Empty state -->
    <div v-if="listings.length === 0" class="flex flex-col items-center justify-center py-24 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M2.048 18.566A2 2 0 0 0 4 21h16a2 2 0 0 0 1.952-2.434l-2-9A2 2 0 0 0 18 8H6a2 2 0 0 0-1.952 1.566z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 11V6a4 4 0 0 1 8 0v5"/>
      </svg>
      <p class="text-sm font-medium text-gray-500 mb-1">No listings yet</p>
      <p class="text-xs text-gray-400 mb-6">
        {{ isOwnProfile ? 'Start selling your pre-loved pieces' : 'This seller has nothing for sale right now.' }}
      </p>
      <!-- The only Add Item button in the empty state, and only on your own page. -->
      <RouterLink v-if="isOwnProfile" to="/sell"
  class="px-6 py-2.5 text-xs  rounded-md btn-solid">
  + Add Item
</RouterLink>
    </div>

    <!-- Listing cards -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
  <div v-for="item in filteredListings" :key="item.id" class="group">
    <div class="relative rounded-sm overflow-hidden bg-gray-100 mb-3 cursor-pointer" style="height: 220px;"
      @click="router.push('/product/' + item.id)">
      <img :src="item.image" :alt="item.name" class="w-full h-full object-cover transition duration-300 group-hover:scale-105" />

      <div v-if="item.sold" class="absolute inset-0 bg-black/40 flex items-center justify-center">
        <span class="text-white text-xs font-medium tracking-widest uppercase">Sold</span>
      </div>
      <div v-else class="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs"
        :style="STATUS_BADGES[item.status]?.style ?? STATUS_BADGES.active.style">
        {{ STATUS_BADGES[item.status]?.label ?? item.status }}
      </div>

      <!-- Offers waiting on this listing. Sits opposite the status badge and
           stays visible (not hover-revealed) — the whole point is being seen. -->
      <RouterLink v-if="isOwnProfile && pendingOffersFor(item.id) > 0"
        :to="`/product/${item.id}`" @click.stop
        class="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-full shadow-sm transition hover:opacity-90"
        style="background-color: #C9A96E;"
        :title="`${pendingOffersFor(item.id)} offer${pendingOffersFor(item.id) > 1 ? 's' : ''}, tap to review`">
        <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
        <span class="text-white" style="font-size: 11.5px;">
          {{ pendingOffersFor(item.id) }} offer{{ pendingOffersFor(item.id) > 1 ? 's' : '' }}
        </span>
      </RouterLink>

      <!-- Owner-only actions, revealed on hover -->
      <div v-if="isOwnProfile" class="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
        <button @click.stop="goEdit(item)"
          class="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-gray-600 hover:text-gray-900 shadow transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 0l.172.172a2 2 0 010 2.828L12 15H9v-2z"/>
          </svg>
        </button>
        <button @click.stop="deleteTarget = item"
          class="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-gray-600 hover:text-red-500 shadow transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
    </div>
    <p class="text-xs font-medium text-gray-800">{{ item.name }}</p>
    <p class="text-xs text-gray-400 uppercase mt-0.5" style="font-size: 11.5px;">{{ item.brand }}</p>

    <!-- Why it was rejected, for the seller only. -->
    <p v-if="isOwnProfile && item.status === 'rejected' && item.rejectionReason"
      class="text-xs text-red-600 mt-1 leading-snug">
      {{ item.rejectionReason }}
    </p>
    <p class="text-xs text-gray-600 mt-0.5">RM {{ item.price.toLocaleString() }}.00</p>
  </div>
</div>

  </div>

  <!-- ===== WISHLIST TAB ===== -->
  <div v-if="activeTab === 'Wishlist'">

    <!-- Empty state -->
    <div v-if="wishlist.length === 0" class="flex flex-col items-center justify-center py-24 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/>
      </svg>
      <p class="text-sm font-medium text-gray-500 mb-1">No saved items yet</p>
      <p class="text-xs text-gray-400 mb-6">Heart items you love to save them here</p>
      <RouterLink to="/shop"
        class="px-6 py-2.5 text-xs  rounded-md btn-solid">
        Browse Shop
      </RouterLink>
    </div>

    <!-- Wishlist grid -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
      <div v-for="item in wishlist" :key="item.id"
        @click="router.push('/product/' + item.id)"
        class="cursor-pointer group">
        <div class="relative rounded-sm overflow-hidden bg-gray-100 mb-3" style="height: 220px;">
          <img :src="item.image" :alt="item.name" class="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
          <!-- Remove from wishlist -->
          <button @click.stop="removeWishlist(item.id)"
            class="absolute top-2 right-2 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow hover:scale-110 transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>
        </div>
        <p class="text-xs font-medium text-gray-800">{{ item.name }}</p>
        <p class="text-xs text-gray-400 uppercase mt-0.5" style="font-size: 11.5px;">{{ item.brand }}</p>
        <p class="text-xs text-gray-600 mt-0.5">RM {{ item.price.toLocaleString() }}.00</p>
      </div>
    </div>

  </div>

  <!-- ===== ORDERS TAB ===== -->
  <div v-if="activeTab === 'Orders'">

    <!-- Filter tabs -->
    <div class="flex items-center gap-6 mb-8 border-b border-gray-100">
      <button v-for="status in orderStatuses" :key="status"
        @click="activeOrderStatus = status"
        class="pb-3 text-xs transition border-b-2"
        :class="activeOrderStatus === status
          ? 'border-gray-800 text-gray-800 font-medium'
          : 'border-transparent text-gray-400 hover:text-gray-600'">
        {{ status }}
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="filteredOrders.length === 0" class="flex flex-col items-center justify-center py-24 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
      </svg>
      <p class="text-sm font-medium text-gray-500 mb-1">No {{ activeOrderStatus.toLowerCase() }} orders</p>
      <p class="text-xs text-gray-400 mb-6">Your purchase history will appear here</p>
      <RouterLink to="/shop"
        class="px-6 py-2.5 text-xs  rounded-md btn-solid">
        Start Shopping
      </RouterLink>
    </div>

    <!-- Order cards -->
    <div v-else class="space-y-4">
      <div v-for="order in filteredOrders" :key="order.id"
        @click="openOrderDetail(order.orderUuid)"
        class="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-5 shadow-sm cursor-pointer transition hover:border-gray-200 hover:shadow-md">

        <!-- Product image -->
        <div class="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          <img :src="order.image" :alt="order.name" class="w-full h-full object-cover" />
        </div>

        <!-- Order info -->
        <div class="flex-1">
          <div class="flex items-start justify-between mb-1">
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-widest mb-0.5">{{ order.brand }}</p>
              <p class="text-sm font-medium text-gray-800">{{ order.name }}</p>
            </div>
            <p class="text-sm font-medium text-gray-700">RM {{ order.price.toLocaleString() }}.00</p>
          </div>
          <p class="text-xs text-gray-400 mb-2">Order #{{ order.orderId }} · {{ order.date }}</p>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <!-- Fulfilment only. Payment state belongs to the whole order and
                   is shown in the detail modal; carrying it here as well put two
                   badges side by side that answer different questions. -->
              <span class="inline-block px-3 py-0.5 rounded-full text-xs font-medium"
                :style="statusStyle(order.status)">
                {{ order.status }}
              </span>
            </div>
            <span class="text-xs text-gray-400">View details →</span>
          </div>

          <!-- Only once it has actually arrived, and only on your own orders.
               @click.stop so rating a seller does not also open the order
               detail modal the card sits inside. -->
          <div v-if="isOwnProfile && order.status === 'Delivered' && order.sellerId"
            class="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap"
            @click.stop>
            <div v-if="order.myReview" class="flex items-center gap-2">
              <StarRating :value="order.myReview.rating" readonly size="sm" />
              <span class="text-xs text-gray-400">Your rating</span>
            </div>
            <span v-else class="text-xs text-gray-400">How was this seller?</span>

            <button type="button" @click="openReview(order)"
              class="text-xs tracking-wider uppercase px-4 py-2 rounded-lg btn-outline-green">
              {{ order.myReview ? 'Edit review' : 'Write a review' }}
            </button>
          </div>
        </div>

      </div>
    </div>

  </div>

  <!-- ===== REVIEWS TAB =====
       Public. This is the point of the feature: a buyer deciding whether to
       trust a seller reads what previous buyers said. -->
  <div v-if="activeTab === 'Reviews'">
    <div v-if="sellerReviews.length === 0" class="flex flex-col items-center justify-center py-24 text-center">
      <p class="text-sm font-medium text-gray-500 mb-1">No reviews yet</p>
      <p class="text-xs text-gray-400">
        {{ isOwnProfile
          ? 'Buyers can rate you once an order has been delivered.'
          : 'This seller has not been reviewed yet.' }}
      </p>
    </div>

    <div v-else>
      <div class="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
        <p class="display text-4xl text-gray-900 tabular-nums">{{ reviewSummary.display }}</p>
        <div>
          <StarRating :value="Math.round(reviewSummary.average)" readonly />
          <p class="text-xs text-gray-400 mt-1">
            {{ reviewSummary.count }} {{ reviewSummary.count === 1 ? 'review' : 'reviews' }}
          </p>
        </div>
      </div>

      <div class="space-y-6">
        <div v-for="review in sellerReviews" :key="review.id"
          class="pb-6 border-b border-gray-100 last:border-0">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-9 h-9 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
              <img v-if="review.avatar" :src="review.avatar" alt="" class="w-full h-full object-cover" />
            </div>
            <div class="min-w-0">
              <p class="text-sm text-gray-800">{{ review.name }}</p>
              <p class="text-xs text-gray-400">{{ review.date }}</p>
            </div>
            <StarRating :value="review.rating" readonly size="sm" class="ml-auto" />
          </div>
          <p v-if="review.body" class="text-sm text-gray-500 leading-relaxed">{{ review.body }}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- ===== REPORTS TAB ===== -->
  <div v-if="activeTab === 'Reports'">

    <div v-if="reportsLoading" class="py-24 text-center">
      <div class="w-6 h-6 border-2 rounded-full animate-spin mx-auto"
        style="border-color: #C9A96E; border-top-color: transparent;"></div>
      <p class="text-xs text-gray-400 mt-3">Loading your reports…</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="myReports.length === 0" class="flex flex-col items-center justify-center py-24 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
      </svg>
      <p class="text-sm font-medium text-gray-500 mb-1">No reports submitted</p>
      <p class="text-xs text-gray-400">
        If you report a listing or a member, you'll be able to follow it here.
      </p>
    </div>

    <div v-else class="space-y-4">
      <p class="text-xs text-gray-400 mb-1">
        We review every report. Once our team responds, their reply appears below.
      </p>

      <div v-for="report in myReports" :key="report.id"
        class="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">

        <div class="flex items-start justify-between gap-4 mb-3">
          <div class="min-w-0">
            <p class="text-sm font-medium text-gray-800">{{ report.reasonLabel }}</p>
            <p class="text-xs text-gray-400 mt-0.5">Filed {{ report.filedOn }}</p>
          </div>
          <span class="px-3 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
            :style="report.statusStyle">
            {{ report.statusLabel }}
          </span>
        </div>

        <!-- What was reported -->
        <div class="flex items-center gap-3 mb-3">
          <div v-if="report.subjectImage" class="w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
            <img :src="report.subjectImage" :alt="report.subject" class="w-full h-full object-cover" />
          </div>
          <div class="min-w-0">
            <p v-if="report.subjectBrand" class="text-xs text-gray-400 uppercase tracking-widest" style="font-size: 11.5px;">
              {{ report.subjectBrand }}
            </p>
            <RouterLink v-if="report.subjectListingId" :to="`/product/${report.subjectListingId}`"
              class="text-xs text-gray-700 hover:underline truncate block">
              {{ report.subject }}
            </RouterLink>
            <p v-else class="text-xs text-gray-500 truncate">{{ report.subject }}</p>
          </div>
        </div>

        <p v-if="report.description" class="text-xs text-gray-500 leading-relaxed mb-3">
          "{{ report.description }}"
        </p>

        <!-- The moderator's reply, once there is one. -->
        <div v-if="report.hasReply" class="rounded-lg px-4 py-3" style="background-color: #F7F5F0;">
          <p class="text-xs tracking-widest uppercase mb-1" style="color: #C9A96E; font-size: 11.5px;">
            Green Atelier response
          </p>
          <p class="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{{ report.adminNotes }}</p>
        </div>
        <p v-else class="text-xs text-gray-400 italic">
          Awaiting a response from our team.
        </p>

      </div>
    </div>

  </div>

</div>

    </div>

    <Footer />
  </div>

<!-- ===== ORDER DETAIL MODAL ===== -->
<Teleport to="body">
  <div v-if="orderDetailOpen"
    @click.self="closeOrderDetail"
    data-lenis-prevent
    class="order-modal-root fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-10 px-4
           bg-black/50 backdrop-blur-sm">
    <div class="order-modal-card bg-white rounded-2xl shadow-xl w-full max-w-md relative">

      <!-- Close -->
      <button @click="closeOrderDetail"
        class="no-print absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
        aria-label="Close">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <div class="px-8 py-8">
        <div v-if="orderDetailLoading" class="py-12 text-center">
          <div class="w-6 h-6 border-2 rounded-full animate-spin mx-auto"
            style="border-color: #C9A96E; border-top-color: transparent;"></div>
          <p class="text-xs text-gray-400 mt-3">Loading order…</p>
        </div>

        <p v-else-if="orderDetailError" class="py-12 text-center text-xs text-red-500">
          {{ orderDetailError }}
        </p>

        <div v-else-if="orderDetail">
          <p class="text-xs tracking-widest uppercase text-center mb-1" style="color: #C9A96E;">Green Atelier</p>
          <h3 class="text-base font-semibold text-gray-800 text-center mb-5">Order Details</h3>

          <div class="flex justify-between items-start border-t border-b border-gray-100 py-3 mb-4">
            <div>
              <p class="text-xs text-gray-400 mb-0.5">Order Number</p>
              <p class="text-xs font-medium text-gray-800">#{{ orderDetail.orderId }}</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-gray-400 mb-0.5">Placed On</p>
              <p class="text-xs font-medium text-gray-800">{{ orderDetail.date }} · {{ orderDetail.time }}</p>
            </div>
          </div>

          <div class="flex items-center gap-2 mb-5 flex-wrap">
            <span class="px-3 py-0.5 rounded-full text-xs font-medium" :style="statusStyle(orderDetail.status)">
              {{ orderDetail.status }}
            </span>
            <span class="px-3 py-0.5 rounded-full text-xs font-medium" :style="paymentStyle(orderDetail.paymentStatus)">
              {{ paymentStatusLabel(orderDetail.paymentStatus) }}
            </span>
            <span v-if="orderDetail.paymentMethod" class="text-xs text-gray-400">
              Via {{ orderDetail.paymentMethod }}
            </span>
          </div>

          <p class="text-xs tracking-widest uppercase text-gray-400 mb-2">Items</p>
          <div class="space-y-3 mb-5">
            <div v-for="item in orderDetail.items" :key="item.id" class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                <img :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs text-gray-400 uppercase tracking-widest" style="font-size: 11.5px;">{{ item.brand }}</p>
                <p class="text-xs text-gray-800 truncate">{{ item.name }}</p>
              </div>
              <p class="text-xs text-gray-700 flex-shrink-0">RM {{ item.price.toLocaleString() }}.00</p>
            </div>
          </div>

          <div v-if="orderDetail.shippingAddress" class="mb-5">
            <p class="text-xs tracking-widest uppercase text-gray-400 mb-2">Shipping To</p>
            <div class="text-xs text-gray-600 leading-relaxed">
              <p>{{ orderDetail.shippingAddress.first_name }} {{ orderDetail.shippingAddress.surname }}</p>
              <p>
                {{ orderDetail.shippingAddress.street_address }}<span v-if="orderDetail.shippingAddress.apartment">, {{ orderDetail.shippingAddress.apartment }}</span>
              </p>
              <p>{{ orderDetail.shippingAddress.postcode }} {{ orderDetail.shippingAddress.city }}, {{ orderDetail.shippingAddress.country }}</p>
              <p v-if="orderDetail.shippingAddress.phone">
                {{ orderDetail.shippingAddress.phone_code }} {{ orderDetail.shippingAddress.phone }}
              </p>
            </div>
          </div>

          <div class="border-t border-gray-100 pt-3 space-y-1.5 mb-3">
            <div class="flex justify-between text-xs text-gray-500">
              <span>Subtotal</span><span>RM {{ orderDetail.subtotal.toLocaleString() }}.00</span>
            </div>
            <div class="flex justify-between text-xs text-gray-500">
              <span>Shipping</span><span>RM {{ orderDetail.shippingFee.toLocaleString() }}.00</span>
            </div>
            <div class="flex justify-between text-xs text-gray-500">
              <span>Platform fee</span><span>RM {{ orderDetail.serviceFee.toLocaleString() }}.00</span>
            </div>
            <div v-if="orderDetail.discount > 0" class="flex justify-between text-xs text-green-600">
              <span>Promo discount{{ orderDetail.promoCode ? ` (${orderDetail.promoCode})` : '' }}</span>
              <span>- RM {{ orderDetail.discount.toLocaleString() }}.00</span>
            </div>
          </div>

          <div class="border-t border-gray-100 pt-3 flex justify-between items-center mb-6">
            <span class="text-sm font-semibold text-gray-800">Total Paid</span>
            <span class="text-sm font-semibold text-gray-800">RM {{ orderDetail.total.toLocaleString() }}.00</span>
          </div>

          <button @click="handleSaveOrderPdf"
            class="no-print w-full py-2.5 text-xs  rounded-md text-center transition btn-solid">
            Save as PDF
          </button>
          <p class="no-print text-xs text-gray-400 text-center mt-2 leading-relaxed">
            In the dialog that opens, set <span class="text-gray-500">Destination</span> to
            <span class="text-gray-500">Save as PDF</span>.
          </p>
        </div>
      </div>
    </div>
  </div>
</Teleport>

<Teleport to="body">
  <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div class="bg-white rounded-2xl shadow-xl px-8 py-8 max-w-sm w-full mx-4 text-center">
      <h3 class="text-base font-semibold text-gray-800 mb-2">Delete Listing?</h3>
      <p class="text-xs text-gray-400 leading-relaxed mb-6">This action cannot be undone.</p>
      <div class="flex gap-3">
        <button @click="deleteTarget = null"
          class="flex-1 py-2.5 text-xs text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition">
          Cancel
        </button>
        <button @click="confirmDelete" :disabled="deleting"
          class="flex-1 py-2.5 text-xs text-white rounded-md disabled:opacity-60"
          style="background-color: #B91C1C;">
          {{ deleting ? 'Deleting…' : 'Delete' }}
        </button>
      </div>
    </div>
  </div>
</Teleport>

<ReportDialog v-model="showReport" :user-id="profileRow?.id ?? null" />

  <!-- Review dialog -->
  <Teleport to="body">
    <div v-if="reviewFor" class="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-4"
      role="dialog" aria-modal="true" aria-labelledby="review-title" @click.self="closeReview">
      <div class="bg-white rounded-2xl border w-full max-w-md px-7 py-7" style="border-color: #E5E0D5;">

        <h3 id="review-title" class="text-lg text-gray-900 mb-1" style="font-family: var(--font-display); font-weight: 500;">
          Rate this seller
        </h3>
        <p class="text-xs text-gray-400 mb-6">{{ reviewFor.brand }} &middot; {{ reviewFor.name }}</p>

        <label class="text-xs text-gray-600 uppercase tracking-widest mb-2 block">Your rating</label>
        <StarRating :value="reviewRating" label="Your rating" class="mb-6"
          @update:value="reviewRating = $event" />

        <label for="review-body" class="text-xs text-gray-600 uppercase tracking-widest mb-2 block">
          Comments <span class="text-gray-400 normal-case tracking-normal">(optional)</span>
        </label>
        <textarea id="review-body" v-model="reviewBody" rows="4" maxlength="1000"
          placeholder="How was the item, and how did the seller handle the sale?"
          class="w-full border rounded-md px-4 py-3 text-sm text-gray-700 outline-none bg-white placeholder-gray-300 resize-y focus:border-[#C9A96E] transition-colors"
          style="border-color: #E5E0D5;"></textarea>

        <p v-if="reviewError" class="text-xs text-red-500 mt-2" role="alert">{{ reviewError }}</p>

        <div class="flex items-center justify-end gap-3 mt-6">
          <button type="button" @click="closeReview"
            class="px-5 py-2.5 text-xs tracking-wider uppercase text-gray-500 hover:text-gray-800 transition">
            Cancel
          </button>
          <button type="button" :disabled="reviewSaving" @click="submitReview"
            class="px-6 py-2.5 text-xs tracking-wider uppercase rounded-lg disabled:opacity-60 btn-solid">
            {{ reviewSaving ? 'Saving…' : 'Submit review' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>

</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import Footer from '../components/Footer.vue'
import ReportDialog from '../components/ReportDialog.vue'
import ToggleSwitch from '../components/ToggleSwitch.vue'
import StarRating from '../components/StarRating.vue'
import { fetchMyReviewsByOrder, fetchSellerReviews, saveReview, summarise } from '../lib/reviews.js'
import { isAuthenticated, profile as ownProfile, userId } from '../lib/auth.js'
import { fetchProfileByUsername, fetchProfileStats } from '../lib/profiles.js'
import { fetchWishlist, removeFromWishlist } from '../lib/wishlist.js'
import { fetchOrderById, fetchOrders } from '../lib/orders.js'
import { fetchMyReports } from '../lib/admin.js'
import { pendingOffersFor } from '../lib/offers.js'
import { paymentStatusLabel } from '../lib/payments.js'
import {
  fetchSellerListings,
  deleteListing
} from '../lib/listings.js'
import { fetchSellerEarnings } from '../lib/payouts.js'
import { showToast } from '../lib/toast.js'

const router = useRouter()
const route = useRoute()

const tabs = ['Listings', 'Reviews', 'Wishlist', 'Orders', 'Reports']
const activeTab = ref(tabs.includes(route.query.tab) ? route.query.tab : 'Listings')

// Listings filters
const listingFilter = ref('all')
const listingSort = ref('latest')
const showSold = ref(false)



// Orders filter
const orderStatuses = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

// ===== Reports the user has filed =====
const myReports = ref([])
const reportsLoading = ref(false)

// ===== Order detail modal =====
// Opens over the Orders tab rather than navigating away, so closing it returns
// the buyer to exactly the list position they were at.
const orderDetailOpen = ref(false)
const orderDetail = ref(null)
const orderDetailLoading = ref(false)
const orderDetailError = ref('')

const ORDER_STATUS_STYLES = {
  Pending: 'background-color: #F3F4F6; color: #4B5563;',
  Processing: 'background-color: #FEF3EC; color: #92400E;',
  Shipped: 'background-color: #EFF6FF; color: #1D4ED8;',
  Delivered: 'background-color: #E8F5EE; color: #166534;',
  Cancelled: 'background-color: #FEF2F2; color: #B91C1C;',
}
const statusStyle = (s) => ORDER_STATUS_STYLES[s] ?? ORDER_STATUS_STYLES.Processing

const PAYMENT_STATUS_STYLES = {
  pending: 'background-color: #FEF3EC; color: #92400E;',
  paid: 'background-color: #E8F5EE; color: #166534;',
  failed: 'background-color: #FEF2F2; color: #B91C1C;',
  refunded: 'background-color: #F3F4F6; color: #4B5563;',
}
const paymentStyle = (s) => PAYMENT_STATUS_STYLES[s] ?? PAYMENT_STATUS_STYLES.pending

const closeOrderDetail = () => {
  orderDetailOpen.value = false
  orderDetail.value = null
  orderDetailError.value = ''
}

const openOrderDetail = async (orderUuid) => {
  orderDetailOpen.value = true
  orderDetailLoading.value = true
  orderDetail.value = null
  orderDetailError.value = ''
  try {
    const detail = await fetchOrderById(orderUuid)
    if (!detail) orderDetailError.value = 'This order could not be found.'
    else orderDetail.value = detail
  } catch (error) {
    orderDetailError.value = error.message
  } finally {
    orderDetailLoading.value = false
  }
}

// Escape closes it, which is what anyone expects of a modal.
const handleModalKeydown = (e) => {
  if (e.key === 'Escape' && orderDetailOpen.value) closeOrderDetail()
}

/**
 * Opens the browser's save/print dialog for the order details.
 *
 * window.print() is the only API a page has here — no browser lets a script pick
 * "Save as PDF" as the destination, or write a file directly. Choosing PDF is
 * the user's step in that dialog, which is why the hint below the button says so.
 *
 * The document title is swapped for the order number first, because that is what
 * the browser suggests as the PDF filename (and prints in the page header).
 */
const handleSaveOrderPdf = () => {
  const previousTitle = document.title
  if (orderDetail.value) {
    document.title = `Green Atelier Order ${orderDetail.value.orderId}`
  }

  const restore = () => {
    document.title = previousTitle
    window.removeEventListener('afterprint', restore)
  }
  window.addEventListener('afterprint', restore)

  window.print()

  // Safari never fires afterprint; restore on the next tick as a fallback.
  setTimeout(restore, 1000)
}
const activeOrderStatus = ref('All')

const STATUS_BADGES = {
  active: { label: 'Active', style: 'background-color: #1B3A2D; color: white;' },
  pending_review: { label: 'In Review', style: 'background-color: #C9A96E; color: white;' },
  draft: { label: 'Draft', style: 'background-color: #9CA3AF; color: white;' },
  rejected: { label: 'Rejected', style: 'background-color: #DC2626; color: white;' },
  archived: { label: 'Archived', style: 'background-color: #6B7280; color: white;' },
}

const profileRow = ref(null)

// --- Reviews ---------------------------------------------------------------
const sellerReviews = ref([])
const myReviews = ref({})
const reviewSummary = computed(() => summarise(sellerReviews.value))

const reviewFor = ref(null)
const reviewRating = ref(0)
const reviewBody = ref('')
const reviewSaving = ref(false)
const reviewError = ref('')

const openReview = (order) => {
  reviewFor.value = order
  reviewRating.value = order.myReview?.rating ?? 0
  reviewBody.value = order.myReview?.body ?? ''
  reviewError.value = ''
}

const closeReview = () => { reviewFor.value = null }

const submitReview = async () => {
  if (!reviewRating.value) {
    reviewError.value = 'Choose a rating from 1 to 5 stars.'
    return
  }

  reviewSaving.value = true
  reviewError.value = ''
  try {
    const saved = await saveReview({
      orderId: reviewFor.value.orderUuid,
      sellerId: reviewFor.value.sellerId,
      buyerId: userId.value,
      rating: reviewRating.value,
      body: reviewBody.value,
    })
    myReviews.value = { ...myReviews.value, [saved.order_id]: saved }
    closeReview()
    showToast("Thank you. Your review is on the seller's profile.")
  } catch (error) {
    reviewError.value = error.message
  } finally {
    reviewSaving.value = false
  }
}

const loadReviews = async (sellerId) => {
  try {
    sellerReviews.value = sellerId ? await fetchSellerReviews(sellerId) : []
    // Only the signed-in buyer's own reviews, and only for their own profile:
    // the Orders tab is the only thing that reads them.
    myReviews.value = isOwnProfile.value && userId.value
      ? await fetchMyReviewsByOrder(userId.value)
      : {}
  } catch (error) {
    // A profile that cannot load its reviews still shows everything else.
    console.error('Could not load reviews:', error.message)
    sellerReviews.value = []
  }
}
const stats = ref({ itemsForSale: 0, sold: 0 })
const earnings = ref({ totalEarnings: 0, paidOut: 0, pendingEarnings: 0, itemsSold: 0 })
const listings = ref([])
const wishlist = ref([])
const orders = ref([])
const loading = ref(true)
const errorMsg = ref('')
const deleteTarget = ref(null)
const deleting = ref(false)

const showReport = ref(false)

const handleReport = () => {
  // reports.reporter_id defaults to auth.uid(), so a report needs a session.
  if (!isAuthenticated.value) {
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  showReport.value = true
}

const goEdit = (item) => {
  router.push({ path: '/sell/details', query: { edit: item.id } })
}

const confirmDelete = async () => {
  const item = deleteTarget.value
  if (!item) return
  deleting.value = true
  try {
    if (item.status === 'sold') {
      showToast('Sold items are part of order history and cannot be deleted.', 'error')
    } else {
      await deleteListing(item.id)
      listings.value = listings.value.filter((i) => i.id !== item.id)
      showToast('Listing deleted.')
    }
  } catch (error) {
    showToast(error.message, 'error')
  } finally {
    deleting.value = false
    deleteTarget.value = null
  }
}

// /profile shows your own page; /profile/:username shows someone else's.
const isOwnProfile = computed(() => !route.params.username || profileRow.value?.id === userId.value)
// Read once into state rather than straight off the query, so it can be dismissed
// without a navigation. The ?submitted=1 flag is stripped from the URL at the same
// time — left in place, a refresh or a shared link would replay the banner.
const justSubmitted = ref(route.query.submitted === '1')
let bannerTimer = null

if (justSubmitted.value) {
  router.replace({ query: { ...route.query, submitted: undefined } })
  bannerTimer = setTimeout(() => (justSubmitted.value = false), 6000)
}

onUnmounted(() => clearTimeout(bannerTimer))

// A user counts as a "seller" once they have ever listed something — active
// listings or a completed sale — so a buyer-only account never sees the
// Seller Overview panel. Deliberately not a stored `is_seller` column: this
// is derived from listing/sale data that already exists.
const isSeller = computed(() => stats.value.itemsForSale > 0 || stats.value.sold > 0)

// Wishlist and order history are private to their owner.
// Reviews about a seller are the reason to look at their profile, so they
// stay visible to a visitor. Wishlist and order history do not.
const visibleTabs = computed(() => (isOwnProfile.value ? tabs : ['Listings', 'Reviews']))

// Shown beside each tab name. Returns 0 for an empty or still-loading section,
// and the template omits the badge entirely in that case: "Orders 0" reads as
// something being wrong, where "Orders" alone reads as nothing to see yet.
const tabCount = (tab) => ({
  Listings: listings.value.length,
  Wishlist: wishlist.value.length,
  Orders: orders.value.length,
  Reports: myReports.value.length,
  Reviews: sellerReviews.value.length,
}[tab] ?? 0)

watch(isOwnProfile, (own) => {
  if (!own && activeTab.value !== 'Listings') activeTab.value = 'Listings'
})

const user = computed(() => {
  const p = profileRow.value
  return {
    firstName: p?.first_name ?? '',
    lastName: p?.last_name ?? '',
    username: p?.username ?? '',
    state: p?.state ?? '',
    country: p?.country ?? 'Malaysia',
    avatar: p?.avatar_url ?? null,
    bio: p?.bio ?? '',
    isTrustedSeller: p?.is_trusted_seller ?? false,
  }
})

const load = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    profileRow.value = route.params.username
      ? await fetchProfileByUsername(route.params.username)
      : ownProfile.value

    if (!profileRow.value) {
      errorMsg.value = 'Profile not found.'
      return
    }

    const id = profileRow.value.id
    stats.value = await fetchProfileStats(id)

    // Public, so this runs for a visitor as well as the owner.
    await loadReviews(id)

    // Visitors only ever see active and sold listings; RLS filters out the
    // seller's drafts and items still in review.
    listings.value = await fetchSellerListings(id)

    // Wishlist, orders and earnings are private, so only load them on your
    // own profile.
    if (id === userId.value) {
      wishlist.value = await fetchWishlist(id)
      orders.value = await fetchOrders(id)
      earnings.value = await fetchSellerEarnings(id)
      // Your own reports only — nobody sees who reported whom.
      reportsLoading.value = true
      try {
        myReports.value = await fetchMyReports()
      } catch (reportError) {
        // A failed report list must not blank out the rest of the profile.
        console.error('Could not load your reports:', reportError.message)
        myReports.value = []
      } finally {
        reportsLoading.value = false
      }
    } else {
      wishlist.value = []
      orders.value = []
      myReports.value = []
      earnings.value = { totalEarnings: 0, paidOut: 0, pendingEarnings: 0, itemsSold: 0 }
    }
  } catch (error) {
    errorMsg.value = error.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  load()
  window.addEventListener('keydown', handleModalKeydown)
})

onUnmounted(() => window.removeEventListener('keydown', handleModalKeydown))
watch(() => route.params.username, load)
// The profile arrives asynchronously on a hard refresh of /profile.
watch(ownProfile, (p) => { if (p && !route.params.username && !profileRow.value) load() })

const filteredListings = computed(() => {
  let result = [...listings.value]
  if (!showSold.value) result = result.filter((i) => !i.sold)
  if (listingFilter.value !== 'all') {
    result = result.filter((i) => i.category?.toLowerCase() === listingFilter.value)
  }
  if (listingSort.value === 'price_asc') result.sort((a, b) => a.price - b.price)
  if (listingSort.value === 'price_desc') result.sort((a, b) => b.price - a.price)
  return result
})

const removeWishlist = async (id) => {
  const previous = wishlist.value
  wishlist.value = wishlist.value.filter((i) => i.id !== id)
  try {
    await removeFromWishlist(userId.value, id)
  } catch (error) {
    errorMsg.value = error.message
    wishlist.value = previous
  }
}

// One card per purchased item, which is how the order list is laid out.
const orderCards = computed(() =>
  orders.value.flatMap((o) =>
    o.items.map((item) => ({
      id: item.id,
      // orderId is the human-readable GA-… number; the receipt route needs the uuid.
      orderUuid: o.id,
      orderId: o.orderId,
      sellerId: o.sellerId,
      name: item.name,
      brand: item.brand,
      price: item.price,
      image: item.image,
      date: o.date,
      // Order-level status, the same value the detail modal shows. Using the
      // item's own status here is what let a card read Delivered while the
      // modal it opened read Shipped.
      status: o.status,
      myReview: myReviews.value[o.id] ?? null,
    })),
  ),
)

const filteredOrders = computed(() => {
  if (activeOrderStatus.value === 'All') return orderCards.value
  return orderCards.value.filter((o) => o.status === activeOrderStatus.value)
})
</script>

<!-- Unscoped on purpose: the order modal is Teleported to <body>, so it sits
     outside this component's DOM subtree and scoped selectors would not reach
     the sibling elements this needs to hide. -->
<style>
@media print {
  /* Guarded with :has() so Ctrl+P with no modal open still prints the page
     normally instead of a blank sheet. Browsers without :has() simply ignore
     these rules and print the whole page — a harmless degradation. */
  body:has(.order-modal-root) > *:not(.order-modal-root) {
    display: none !important;
  }

  body:has(.order-modal-root) .order-modal-root {
    position: static !important;
    display: block !important;
    overflow: visible !important;
    /* Drop the dimmed, blurred backdrop — it would render as a grey wash. */
    background: none !important;
    backdrop-filter: none !important;
    padding: 0 !important;
  }

  body:has(.order-modal-root) .order-modal-card {
    max-width: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
  }

  .no-print {
    display: none !important;
  }
}
</style>
<style scoped>
/* One bordered control holding both its label and its value, matching the
   Filters button on Shop. The native select keeps its own arrow but loses its
   box, so the pill is the only visible frame. */
.control-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  background: #fff;
  padding: 0.375rem 0.5rem 0.375rem 0.875rem;
  transition: border-color 0.2s ease;
}

.control-pill:hover,
.control-pill:focus-within {
  border-color: #d1d5db;
}

.control-pill__label {
  color: #9ca3af;
  font-size: 0.8125rem;
  white-space: nowrap;
}

.control-pill__value {
  border: 0;
  background: transparent;
  outline: none;
  color: #374151;
  font-size: 0.8125rem;
  padding-right: 0.25rem;
  cursor: pointer;
}

/* The submitted banner leaves on its own after six seconds; easing it out and
   collapsing its height keeps the page from snapping upward as it goes. */
.banner-leave-active {
  transition:
    opacity 0.35s ease,
    transform 0.35s ease,
    margin 0.35s ease,
    max-height 0.35s ease;
  overflow: hidden;
  max-height: 12rem;
}

.banner-leave-to {
  opacity: 0;
  transform: translateY(-6px);
  max-height: 0;
  margin-bottom: 0;
}
</style>
