# Test Cases

## Authority Transitions

### 1.1 From AP to NAP (Authorized -> Not Authorized)

- **Context**: The domain owner built the website using a WordPress plugin themselves, rather than through `test-tools`.
- **Expected Result**:
  - `hasAuthority` should be updated to `0`
  - If `status !== 'ignore'` and `isAvailable === 1`, the profile should be added to `unauthorizedProfiles`
  - `status` should be changed to `'ignore'` automatically
- **Test Steps**:
  1. Add a profile to `test-tools` website.
  2. Update the cluster.
  3. Add the same profile to self-built WordPress site (AP).
  4. Verify the first profile appears in `unauthorizedProfiles` with `status = 'ignore'`.

### 1.2 From NAP to AP (Not Authorized -> Authorized)

- **Context**: The profile is moved back to an authorized domain. For example: self-built WordPress is removed, and the `test-tools` becomes authorized.
- **Expected Result**:
  - `hasAuthority` should be updated to `1`
  - `status` should remain unchanged (manual editing required)
- **Test Steps**:
  1. Remove the profile from self-built WordPress site.
  2. Update the cluster.
  3. Confirm the profile from `test-tools` has `hasAuthority = 1` again.

### 1.3 Unavailable prorfile revalidated

- **Context**: Re-checking profiles if the profile is not available.
- **Expected Result**: The profile should should update in the background.
- **Test Steps**:
  1. Temporarily make the WordPress website unavailable.
  2. Create a new cluster to get the profiles.
  3. Confirm the profile is unavailble in the list.
  4. Make the site available again.
  5. Update the cluster.
  6. Go to `Edit Node` page and see the profile becomes available.

## Profile State Edge Cases

### 2.1 Deleted in index, not present locally

- **Context**: A profile marked as deleted is returned from the index, but not present locally.
- **Expected Result**: Skipped silently with no error or updates.
- **Test Steps**:
  1. Simulate a deleted profile in index that's missing locally.
  2. Update the cluster.
  3. Verify no error is shown, and nothing is deleted.

### 2.2 New profile from a NAP domain

- **Context**: A new profile is published on a domain without authority.
- **Expected Result**:
  - Should show up in the updated List with `hasAuthority = 0`
- **Test Steps**:
  1. Publish a profile on a domain like `test-tool`.
  2. Update the cluster.
  3. Verify it appears in `profileList` with `hasAuthority = 0`

### 2.3 New profile from an AP domain

- **Context**: A new profile from an authorized domain.
- **Expected Result**:
  - Profile is added to `profileList`
  - Unauthroized profiles should show up in the unauthorized profile list.
- **Test Steps**:
  1. Publish a profile on a selft-built WordPress domain.
  2. Update the cluster.
  3. Verify it appears in `profileList` with `hasAuthority = 1`, and unauthroized profiles should show up in the unauthorized profile list.

## Timestamp Synchronization

### 3.1 Same timestamp – no update

- **Context**: `last_updated` timestamp matches the last trigger time.
- **Expected Result**: Update the last_updated after click the `Update Node` button.
- **Test Steps**:
  1. Record the current last_updated timestamp.
  2. Update the cluster.
  3. Confirm last_updated is applied and shown in the cluster list.

## Error and Empty Response Handling

### 4.1 API Error Handling

- **Context**: Simulate an API error in `fetchProfiles`, `updateNode`, or `deleteNode`.
- **Expected Result**:
  - Error is caught
  - Toast displays the error
  - Flow continues without crashing
- **Test Steps**
  - Change the URL of index_url in the cluster.
  - Update the cluster.
  - Should show up the errors in the toast and redirect to the home page.

### 4.2 No updates returned

- **Context**: No updates, deleted, or unauthorized profiles are returned.
- **Expected Result**:
  - Toast message: `"No updated profiles found."`
  - User is redirected to `/`
