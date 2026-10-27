# Detailed Donation & Donor List View Implementation

## Completed Features
- [x] **New Component (`DonorsListSection.tsx`)**:
  - Detailed list view displaying all recorded donations (from `DonateModal` and direct ledger entries) with donor name, amount, category, date, and payment method/notes.
  - **KPI Cards**: Displays summary statistics including total donation income, online donations total, donor count, highest single donation, and average donation.
  - **Search & Filters**: Real-time search by donor name, phone number, category, or note/TrxID. Interactive filter chips for sources (`🌐 অনলাইন দানসমূহ` vs `🏛️ ক্যাশ/সরাসরি`), categories (`বিশেষ দান`, `জুমার দান`, `সাধারণ দান`, `সদস্য চাঁদা`, `উন্নয়ন তহবিল`, `যাকাত/ফিতরা`), and timeframes.
  - **Printable Digital Receipt Modal**: Allows previewing and printing official mosque digital receipts for any donation entry.
- [x] **Integration into MosqueAccountsSection**:
  - Added `donations` sub-tab (`দান ও দাতা তালিকা`) to the Accounts sub-navigation menu with a live badge count of recorded donations.
  - Connected `onOpenDonateModal` to allow launching `DonateModal` directly from the donor list.
  - Added shortcut button in the Income entry tab header leading directly to the donor list.
- [x] **Seed Data Update**:
  - Added realistic online donation seed entries in `INITIAL_STATE.tx` (`storage.ts`).
- [x] **Verification**:
  - `lint_applet` passed (`tsc --noEmit`).
  - `compile_applet` passed successfully.
