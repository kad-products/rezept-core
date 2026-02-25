# Releases

Gathering notes as I start the process of going from just local to the integration environment.  

## Integration

### Wranlger File

I updated my wrangler file to have things structured for multiple environments.  I started reading the docs and honestly kind of figured I might as well just have Claude do it.  I'm not going to meaningfully retain that information anyway.  Commit 0120b3e32f7f5057969d097cd3877c9df5780a36 is the one for these changes.  Keep everything at the top level as that is what wrangler uses locally.

### Provision Infrastructure

The `wrangler.jsonc` manages mapping details but it doesn't actually do the provisioning.  So before deploying to a new environment we need to do the provisioning.  Since we use TF for other provisioning we're using it here, too.  

1. `cd` into `terraform/<environment>`
2. `terraform init`
3. `terraform apply`
4. `terraform output -raw wrangler_env | jq` to get the outputs
5. Paste them into the appropriate environment within the `wrangler.json`

### Deploy

- `integration`: merge to `main`
- `staging`: run the manual job created for a tag
- `prodution`: run another manual job off the same workflow as the `staging` job was run on