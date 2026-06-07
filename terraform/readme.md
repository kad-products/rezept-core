# Terraform

Just a quick way to apply some rules to the repo.  Could pull out into a module at some point but this gets us started.

## Usage

```sh
cd terraform

# Set GitHub token
export GITHUB_TOKEN=ghp_your_token_here_with_gh_project_perms

# Initialize
terraform init

# Preview changes
terraform plan -var="rezept_core_workflow_automation=$GITHUB_TOKEN_REZEPT_CORE_WORKFLOW_AUTOMATION"

# Apply protection rules
terraform apply -var="rezept_core_workflow_automation=$GITHUB_TOKEN_REZEPT_CORE_WORKFLOW_AUTOMATION"
```

## Steps

1. **Go to GitHub Settings**
   - Navigate to: https://github.com/settings/tokens
   - Click "Fine-grained tokens" tab
   - Click "Generate new token"

2. **Token Configuration**
   - **Token name**: `Terraform Branch Protection`
   - **Expiration**: Choose appropriate duration (90 days recommended)
   - **Resource owner**: `kad-products`
   - **Repository access**: 
     - Select "All repositories" (for managing multiple repos)
     - OR "Only select repositories" → choose specific repos

3. **Permissions**

   **Repository permissions:**
   - `Administration`: **Read and write** (required for branch protection)
   - `Metadata`: **Read-only** (automatically selected)

   **Account permissions:**
   - None needed

4. **Generate and Save**
   - Click "Generate token"
   - Copy the token immediately (shown only once)
   - Store securely (password manager)

5. **Use in Terraform**
   ```bash
   export GITHUB_TOKEN=ghp_your_token_here
   ```
