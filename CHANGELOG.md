## [1.30.0](https://github.com/kad-products/rezept-core/compare/v1.29.0...v1.30.0) (2026-05-29)

### Features

* move the scrape processing attempt to child table ([3658b11](https://github.com/kad-products/rezept-core/commit/3658b11ca6df9bafbf740dc7264e02fcbb82086d))

## [1.29.0](https://github.com/kad-products/rezept-core/compare/v1.28.0...v1.29.0) (2026-05-29)

### Features

* add jobs DO and incorporate into API ([47b88d9](https://github.com/kad-products/rezept-core/commit/47b88d96c5d9ff0d5ba20edbc6938b11153467e2))
* link recipe scrape to created recipe ([290bdb3](https://github.com/kad-products/rezept-core/commit/290bdb3ac7499ce87e8cc5087e6e3608c40721e5))
* repo, model, and api for background jobs ([890f88e](https://github.com/kad-products/rezept-core/commit/890f88ed7adea7bb3c7cb51afb8c1834c58611d8))

### Bug Fixes

* remove job durable objects ([edf34a2](https://github.com/kad-products/rezept-core/commit/edf34a2a36918fdcc928144d09f16ae66c63713c))
* remove never used jobs D1 setup ([5b3a3c2](https://github.com/kad-products/rezept-core/commit/5b3a3c24970c93cdddc5e3658db4778e7d8e3101))
* remove never used jobs permissions ([4b89622](https://github.com/kad-products/rezept-core/commit/4b896227ecfa4304a1df064cb8afade6a80b9779))
* remove never-used jobs api ([cca1c38](https://github.com/kad-products/rezept-core/commit/cca1c3829c64be326e8e1c974dff656b78f04da3))
* remove never-used jobs repositories ([f9ea2c7](https://github.com/kad-products/rezept-core/commit/f9ea2c70132a5db835e94684e5a0370f879223bf))

## [1.28.0](https://github.com/kad-products/rezept-core/compare/v1.27.0...v1.28.0) (2026-05-26)

### Features

* basic view for cover images ([3869264](https://github.com/kad-products/rezept-core/commit/3869264a093eac989aced71cb61bed2079eefd54))

### Bug Fixes

* d1 doesn't support full transaction syntax ([9548bb4](https://github.com/kad-products/rezept-core/commit/9548bb445e49d2b10f498bc53373a5ab67ff099a))

## [1.27.0](https://github.com/kad-products/rezept-core/compare/v1.26.0...v1.27.0) (2026-05-26)

### Features

* update scrape processing to include cover image ([#295](https://github.com/kad-products/rezept-core/issues/295)) ([8b04ae3](https://github.com/kad-products/rezept-core/commit/8b04ae3dc711c2fa3a8a7d05199fb472d1db1b16))

### Bug Fixes

* remove rezept_images from staging/production until ready to deploy ([924c828](https://github.com/kad-products/rezept-core/commit/924c8287fadf4f58e2226f5318c5f0c3ea2294c1))

## [1.26.0](https://github.com/kad-products/rezept-core/compare/v1.25.5...v1.26.0) (2026-05-26)

### Features

* add images data model, repositories, and migrations ([#293](https://github.com/kad-products/rezept-core/issues/293)) ([9ae2d5f](https://github.com/kad-products/rezept-core/commit/9ae2d5f33911d31cf29549544b2b146b827d6149))

## [1.25.5](https://github.com/kad-products/rezept-core/compare/v1.25.4...v1.25.5) (2026-05-20)

### Bug Fixes

* try another version match ([7c35fe3](https://github.com/kad-products/rezept-core/commit/7c35fe334252d4c273e4bea93fcac997eecb6304))

## [1.25.4](https://github.com/kad-products/rezept-core/compare/v1.25.3...v1.25.4) (2026-05-19)

### Bug Fixes

* **ci:** pass CI=true to Renovate container so pnpm runs non-interactively ([000d8de](https://github.com/kad-products/rezept-core/commit/000d8de88ebdcec55208dc7bc800ba45c10a7e62))
* revert wrangler to avoid goofy typing setup ([125f6b0](https://github.com/kad-products/rezept-core/commit/125f6b01ba2ab4f7d8d7395a0a39e8c56db2ee9c))

## [1.25.3](https://github.com/kad-products/rezept-core/compare/v1.25.2...v1.25.3) (2026-05-17)

### Bug Fixes

* **deps:** update dependency rwsdk to v1.2.8 ([9df42e7](https://github.com/kad-products/rezept-core/commit/9df42e78a7be7b40a6f67cdf0d7e33f017114213))

## [1.25.2](https://github.com/kad-products/rezept-core/compare/v1.25.1...v1.25.2) (2026-05-17)

### Bug Fixes

* add satisfies annotation to schema utils ([5c939ff](https://github.com/kad-products/rezept-core/commit/5c939fff04a8c02b5646f314e7934f71eda74c3c))

## [1.25.1](https://github.com/kad-products/rezept-core/compare/v1.25.0...v1.25.1) (2026-05-09)

### Bug Fixes

* use the correct credential ID in the repository methods ([086c141](https://github.com/kad-products/rezept-core/commit/086c141df29ef127185a3886519b1ee1cffd862d))

## [1.25.0](https://github.com/kad-products/rezept-core/compare/v1.24.1...v1.25.0) (2026-05-07)

### Features

* setup renovate ([fcdd62a](https://github.com/kad-products/rezept-core/commit/fcdd62a00e908bbba64b63e5523f5f9408d2b232))

## [1.24.1](https://github.com/kad-products/rezept-core/compare/v1.24.0...v1.24.1) (2026-05-06)

### Bug Fixes

* solve for step reordering race condition ([0453d2d](https://github.com/kad-products/rezept-core/commit/0453d2ddc7395c7aff96f96b3716df64ce6d1511))

## [1.24.0](https://github.com/kad-products/rezept-core/compare/v1.23.0...v1.24.0) (2026-05-06)

### Features

* wire up cloudflare beacon token ([8cce511](https://github.com/kad-products/rezept-core/commit/8cce51188a1afaefd77ef42951226e8c222d5871))

## [1.23.0](https://github.com/kad-products/rezept-core/compare/v1.22.0...v1.23.0) (2026-05-05)

### Features

* actually use soft delete fields to filter results ([041ac0f](https://github.com/kad-products/rezept-core/commit/041ac0fc5cefa5b6b5d417d347c1340c290cd874))
* added initial delete methods to key repositories ([03b5a66](https://github.com/kad-products/rezept-core/commit/03b5a669d2c2e1b409daae64807c5345772d7e5f))

## [1.22.0](https://github.com/kad-products/rezept-core/compare/v1.21.1...v1.22.0) (2026-05-05)

### Features

* allow createdBy and ownership userId to be different at repo level ([39d0da9](https://github.com/kad-products/rezept-core/commit/39d0da947ce5d0a77c3c10de842efb32daea7e40))

### Bug Fixes

* add audit fields to users and credentials ([01b7570](https://github.com/kad-products/rezept-core/commit/01b7570e775eb9896a6c3e84dd89d1f97ad0d8ee))
* populate the updated* fields in repo layer ([04925a5](https://github.com/kad-products/rezept-core/commit/04925a5bdbef8169508e4428c2bb7281ef50c4ca))

## [1.21.1](https://github.com/kad-products/rezept-core/compare/v1.21.0...v1.21.1) (2026-05-04)

### Bug Fixes

* javascript can't handle the nulls ([558ba6c](https://github.com/kad-products/rezept-core/commit/558ba6cec13b4ce716f21af4a028194251ef1d29))

## [1.21.0](https://github.com/kad-products/rezept-core/compare/v1.20.2...v1.21.0) (2026-05-04)

### Features

* moves raw scrape data to R2 ([cf8436d](https://github.com/kad-products/rezept-core/commit/cf8436d306cb7d5f0039c02dc2137a0892f3a4eb))

## [1.20.2](https://github.com/kad-products/rezept-core/compare/v1.20.1...v1.20.2) (2026-05-04)

### Bug Fixes

* basic worker pool tests and handling serverAction errors ([593fb13](https://github.com/kad-products/rezept-core/commit/593fb13ec8ecd3c85448f319eeacd54349ac343c))
* make scrape status text optional ([b8352cb](https://github.com/kad-products/rezept-core/commit/b8352cb79ed7412a306f069d21caf7fcfe73681f))
* remove unused RecipeScrapeWriteInput type ([fd625fe](https://github.com/kad-products/rezept-core/commit/fd625fee234025e242fec9057a2a41a8d73bb354))

### Code Refactoring

* align ingredient-units types to standard ([3da949f](https://github.com/kad-products/rezept-core/commit/3da949f1eeae34ad7cfa407836661ed2ad9cb644))
* api key and ingredient types to standard ([d0190e7](https://github.com/kad-products/rezept-core/commit/d0190e73a36e7bc1386f764e2a244449da8872ad))
* more type shuffling ([8b09b55](https://github.com/kad-products/rezept-core/commit/8b09b5563bb26a303efef4ea0cc17c29d50f877b))
* move credentials types to new standards ([9e2b8ee](https://github.com/kad-products/rezept-core/commit/9e2b8eefa39263c305160db43b7d838471884cc1))
* move recipe types to correct files ([2279a3b](https://github.com/kad-products/rezept-core/commit/2279a3bf3bab730469fbde71abf1eca470e610a9))
* omit fields from CredentialDBWrite to match standard ([9a0e24b](https://github.com/kad-products/rezept-core/commit/9a0e24b8d5e5cda1527bccc34c41a7c1ba7642b2))
* remove unused UserFormInput type ([a8642bd](https://github.com/kad-products/rezept-core/commit/a8642bdb79955a036d2f36750c567437e3a52cea))
* rename api key form input type ([60fb0c6](https://github.com/kad-products/rezept-core/commit/60fb0c663670443d8999a680c8772112f3d28371))
* rename ApiKeyDBRead type to new standard ([723d8b6](https://github.com/kad-products/rezept-core/commit/723d8b6db2c29e49fd54bb5dfec451757e277ca9))
* use CredentialWriteInput to align to standards ([473f3a8](https://github.com/kad-products/rezept-core/commit/473f3a850f451c71eaa2b34997641974851114ee))
* use RecipeDBRead to follow standards ([ed2d201](https://github.com/kad-products/rezept-core/commit/ed2d201fa67912003bbb52e9291762dc42f0fc55))
* use RecipeFormInput to align with standards ([abf8d48](https://github.com/kad-products/rezept-core/commit/abf8d484d0fd7b21a277b8cac62e80a5d5b4e072))
* use RecipeIngredientDBRead for type to be standard ([f4608e3](https://github.com/kad-products/rezept-core/commit/f4608e37104af03cb042143b1a6e08845b3c1048))
* use RecipeIngredientWriteInput to follow standards ([c46d9d0](https://github.com/kad-products/rezept-core/commit/c46d9d012c9e5b421fc505a03c39a9bdc976619a))
* use RecipeInstructionDBRead to follow standards ([3326d38](https://github.com/kad-products/rezept-core/commit/3326d38027f56c016ead034942aacbff1b75febb))
* use RecipeInstructionWriteInput to follow standards ([8948d88](https://github.com/kad-products/rezept-core/commit/8948d88d33f1c5a900a440794851e757ebdc9295))
* use RecipeScrapeDBRead to follow standards ([2da563a](https://github.com/kad-products/rezept-core/commit/2da563ad8ed14f49e7699813a712baa9786e8674))
* use RecipeSectionDBRead to follow standards ([7a82c48](https://github.com/kad-products/rezept-core/commit/7a82c48999e404961d74f937ea7170d45f38fe8f))
* use RecipeSectionWriteInput to follow standards ([c7a9d47](https://github.com/kad-products/rezept-core/commit/c7a9d47a492763335e1e28a52704f1fb0bb5c44c))
* use RecipeUploadDBRead to follow standards ([6e3e46b](https://github.com/kad-products/rezept-core/commit/6e3e46b42b37188b5718d881433fc5b87b0b42d1))
* use RecipeUploadWriteInput to follow standards ([1d7775e](https://github.com/kad-products/rezept-core/commit/1d7775ec13d06f74f6423bbfa8d5735727046536))
* use RecipeWriteInput to follow standards ([f56ced1](https://github.com/kad-products/rezept-core/commit/f56ced1489ffb8bdbc8248b03db817763b1d1c47))
* use SeasonalIngredientDBRead to follow standards ([6911f53](https://github.com/kad-products/rezept-core/commit/6911f53dfe64d9471b25421ec30dc01d1e747ed3))
* use SeasonDBRead to follow standards ([f1287bb](https://github.com/kad-products/rezept-core/commit/f1287bbefc24937e6dc722b7ae6031286218fdda))
* use SeasonFormInput to align to standards ([990c335](https://github.com/kad-products/rezept-core/commit/990c3350b2a4484d330b45d3af63b32eb70df413))
* use SeasonWriteInput to follow standards ([f463ffd](https://github.com/kad-products/rezept-core/commit/f463ffdf19ca9992cef12fe30a52e01ceda629f9))
* use UserDBRead to follow standards ([fc905de](https://github.com/kad-products/rezept-core/commit/fc905dea83d23567e1542b5377b7060e3c53e5c8))
* use UserWriteInput to follow standards ([e412662](https://github.com/kad-products/rezept-core/commit/e41266293290963aa7ca26ca111eeb0008b213e6))

## [1.20.1](https://github.com/kad-products/rezept-core/compare/v1.20.0...v1.20.1) (2026-05-03)

### Code Refactoring

* rename sessions DO to be actually named sessions ([8d0c63c](https://github.com/kad-products/rezept-core/commit/8d0c63c4680a2e30dc8231ef19a074ce0fd4b1fd))

## [1.20.0](https://github.com/kad-products/rezept-core/compare/v1.19.12...v1.20.0) (2026-05-02)

### Features

* throw RzAccessError from interrupters; add nested error handling ([43b4734](https://github.com/kad-products/rezept-core/commit/43b4734dce98754e0917156e03a529277b635dd6))

### Bug Fixes

* prepare for api vs browser error handling ([3745926](https://github.com/kad-products/rezept-core/commit/37459262fbfa245445ea3bbf02bbf3370cf5edd8))

## [1.19.12](https://github.com/kad-products/rezept-core/compare/v1.19.11...v1.19.12) (2026-05-02)

### Bug Fixes

* move more types to correct place ([9f281bd](https://github.com/kad-products/rezept-core/commit/9f281bd1ed8c71c078e9b67eb0917faeec6e96c9))

## [1.19.11](https://github.com/kad-products/rezept-core/compare/v1.19.10...v1.19.11) (2026-05-02)

### Bug Fixes

* use the recipe form schema directly in recipe form validation ([47f1535](https://github.com/kad-products/rezept-core/commit/47f15359dee9327328ae36d54d865f3d2c9a269f))

## [1.19.10](https://github.com/kad-products/rezept-core/compare/v1.19.9...v1.19.10) (2026-05-02)

### Bug Fixes

* adjust middleware return pattern ([e717b8a](https://github.com/kad-products/rezept-core/commit/e717b8ac70e1da9f663328d352bab6ce33cf18f4))

## [1.19.9](https://github.com/kad-products/rezept-core/compare/v1.19.8...v1.19.9) (2026-05-02)

### Bug Fixes

* don't import requestInfo and destructure ctx ([14b1835](https://github.com/kad-products/rezept-core/commit/14b18351f2000dc04a0360ab08904500a0b6390e))

## [1.19.8](https://github.com/kad-products/rezept-core/compare/v1.19.7...v1.19.8) (2026-05-02)

### Bug Fixes

* no relative imports ([600d478](https://github.com/kad-products/rezept-core/commit/600d47857ed3fc0e947a3fb9099eeafcfee83a9e))

## [1.19.7](https://github.com/kad-products/rezept-core/compare/v1.19.6...v1.19.7) (2026-05-02)

### Bug Fixes

* remove unused credentials schema ([4460ecf](https://github.com/kad-products/rezept-core/commit/4460ecf708bd191edba981ce92ae5e4812736647))
* start using the users schema on registration ([629743f](https://github.com/kad-products/rezept-core/commit/629743feee39193f66296969082514b6a19ddfcb))

## [1.19.6](https://github.com/kad-products/rezept-core/compare/v1.19.5...v1.19.6) (2026-05-02)

### Bug Fixes

* avoid view link if season hasn't been viewed ([398049c](https://github.com/kad-products/rezept-core/commit/398049cd2540fc0c7ff9492f746c4ef0c10f026f))

## [1.19.5](https://github.com/kad-products/rezept-core/compare/v1.19.4...v1.19.5) (2026-05-02)

### Bug Fixes

* move flattened permissions to source data file ([27f5224](https://github.com/kad-products/rezept-core/commit/27f522447056c54fae5f39bfa5ff2afa75a7a732))
* move permissions values to source data file ([0252e6e](https://github.com/kad-products/rezept-core/commit/0252e6e07c7b42fbe57fa58cdb5716206f599d1d))
* move PermissionsKey to types file ([ad6092c](https://github.com/kad-products/rezept-core/commit/ad6092c2d32cdd84ddd841d97f75d35ad8b7cc7f))

## [1.19.4](https://github.com/kad-products/rezept-core/compare/v1.19.3...v1.19.4) (2026-05-01)

### Bug Fixes

* better step errors and logging ([dcc79cd](https://github.com/kad-products/rezept-core/commit/dcc79cd457d7bce7a6b89ebe0e5fe0bcd823d3f7))
* rzsteperror requires a dev message ([147bc54](https://github.com/kad-products/rezept-core/commit/147bc546d531648d3e4e5311863de97c0ba02afd))

## [1.19.3](https://github.com/kad-products/rezept-core/compare/v1.19.2...v1.19.3) (2026-05-01)

### Bug Fixes

* cleanup placeholder tests ([13d6682](https://github.com/kad-products/rezept-core/commit/13d6682d79f7eb8aa5c5c9307194185c75270240))

## [1.19.2](https://github.com/kad-products/rezept-core/compare/v1.19.1...v1.19.2) (2026-05-01)

### Bug Fixes

* align repositories to standard validation and errors ([486b31c](https://github.com/kad-products/rezept-core/commit/486b31c96422e6b17d0e64fdd5ea9b5590bfb4b3))

## [1.19.1](https://github.com/kad-products/rezept-core/compare/v1.19.0...v1.19.1) (2026-05-01)

### Bug Fixes

* makes all schemas into form and api validators ([56b83c5](https://github.com/kad-products/rezept-core/commit/56b83c5ad130166802e7aa064c75b93b17054ce6))

## [1.19.0](https://github.com/kad-products/rezept-core/compare/v1.18.21...v1.19.0) (2026-05-01)

### Features

* provide error fallback route ([b19b174](https://github.com/kad-products/rezept-core/commit/b19b17415e980cea8f19735f525a6f8c3daed9a4))

### Bug Fixes

* remove dead code checks and throw to error handler ([8f5762a](https://github.com/kad-products/rezept-core/commit/8f5762afb5bc7b2bdd294605b77c7a0bf607b4de))
* revert actions barrel export to solve build and dev server problems ([6defc54](https://github.com/kad-products/rezept-core/commit/6defc546442b4ae43fd28dba6204427e48675e26))

## [1.18.21](https://github.com/kad-products/rezept-core/compare/v1.18.20...v1.18.21) (2026-04-30)

### Bug Fixes

* use interruptor and perms for protected profile pages ([d853c49](https://github.com/kad-products/rezept-core/commit/d853c49481a2cbe556d71a286d011060737b5986))

## [1.18.20](https://github.com/kad-products/rezept-core/compare/v1.18.19...v1.18.20) (2026-04-30)

### Code Refactoring

* move repositories to barrel export ([a67355c](https://github.com/kad-products/rezept-core/commit/a67355c276071519160750e9dd4c4b21bf2f49d4))
* move request context out of repos ([aba33c1](https://github.com/kad-products/rezept-core/commit/aba33c162f360d816cad94c856c06ab857873dd8))

## [1.18.19](https://github.com/kad-products/rezept-core/compare/v1.18.18...v1.18.19) (2026-04-30)

### Bug Fixes

* align session middleware to filename ([03543b5](https://github.com/kad-products/rezept-core/commit/03543b5a3ea81fec19a9a7017dacf3d8278b321c))

## [1.18.18](https://github.com/kad-products/rezept-core/compare/v1.18.17...v1.18.18) (2026-04-30)

### Bug Fixes

* cleanup inline auth checks ([867b838](https://github.com/kad-products/rezept-core/commit/867b838093ac1bd27cda0a405ece9f50de2f4e34))
* use requireAuth interruptor in actions ([8726319](https://github.com/kad-products/rezept-core/commit/872631956c534c3a73bcff0d531eb495aff209a7))

## [1.18.17](https://github.com/kad-products/rezept-core/compare/v1.18.16...v1.18.17) (2026-04-30)

### Bug Fixes

* use the right permissions on recipe creation ([533b726](https://github.com/kad-products/rezept-core/commit/533b7268ffe1cddf93c0312587a472ca2d026cb7))

## [1.18.16](https://github.com/kad-products/rezept-core/compare/v1.18.15...v1.18.16) (2026-04-30)

### Bug Fixes

* handle get credentials error better ([5102ad6](https://github.com/kad-products/rezept-core/commit/5102ad6ca701e1b3ade0aeecdc8de40b236a80a5))
* tests and docs about catching getXXXById since it'll throw ([9e82fc8](https://github.com/kad-products/rezept-core/commit/9e82fc89a07e6d557b23f61210f6ec2c2ee0f378))

## [1.18.15](https://github.com/kad-products/rezept-core/compare/v1.18.14...v1.18.15) (2026-04-30)

### Bug Fixes

* move inferred type to explicit and into types/ dir ([b6eb2e0](https://github.com/kad-products/rezept-core/commit/b6eb2e0bb0543b1213ed968a2ff3a7cced47417c))

## [1.18.14](https://github.com/kad-products/rezept-core/compare/v1.18.13...v1.18.14) (2026-04-30)

### Code Refactoring

* add tests for auth and registration actions ([9baf63e](https://github.com/kad-products/rezept-core/commit/9baf63e07d756daa7e056dd6967f16b8993982eb))
* split registration and auth actions ([e613ff4](https://github.com/kad-products/rezept-core/commit/e613ff40a0a5bb1a24923b4d921042966080d852))

## [1.18.13](https://github.com/kad-products/rezept-core/compare/v1.18.12...v1.18.13) (2026-04-30)

### Bug Fixes

* added tests for api endpoints ([f91fa38](https://github.com/kad-products/rezept-core/commit/f91fa382b0643f5d8115f50a80399a450c93bc7b))
* align return type to actual return possibilities ([fd96673](https://github.com/kad-products/rezept-core/commit/fd96673e63f5c346112179a2118d7a82c4ece92f))
* api handlers export and named properly ([e7da8cd](https://github.com/kad-products/rezept-core/commit/e7da8cd4da89e1b1ea819061018cc31dde3128fc))
* create actions barrel export ([51bd93d](https://github.com/kad-products/rezept-core/commit/51bd93d28c0a1a7a4046f367276172c3eaa1143a))

## [1.18.12](https://github.com/kad-products/rezept-core/compare/v1.18.11...v1.18.12) (2026-04-30)

### Bug Fixes

* move SeasonFormData type to types ([9064a07](https://github.com/kad-products/rezept-core/commit/9064a078673758277b65f61183cdb6656ded54ce))

## [1.18.11](https://github.com/kad-products/rezept-core/compare/v1.18.10...v1.18.11) (2026-04-30)

### Bug Fixes

* change Pages__recipes__upload_view naming convention ([fed1931](https://github.com/kad-products/rezept-core/commit/fed193125fb7266101c5e4d93126ddc8f3058485))

## [1.18.10](https://github.com/kad-products/rezept-core/compare/v1.18.9...v1.18.10) (2026-04-30)

### Bug Fixes

* remove extra wrapper from bookmarklet install page ([d108f60](https://github.com/kad-products/rezept-core/commit/d108f60f456b963cb2dfe349a89dfdc0a422c652))

## [1.18.9](https://github.com/kad-products/rezept-core/compare/v1.18.8...v1.18.9) (2026-04-30)

### Bug Fixes

* streamline schema utils ([e199619](https://github.com/kad-products/rezept-core/commit/e199619b46ed68d3fa1de2936d7a21ec8c039389))

## [1.18.8](https://github.com/kad-products/rezept-core/compare/v1.18.7...v1.18.8) (2026-04-30)

### Bug Fixes

* add logger to api-key middleware test mock ctx ([f5e213d](https://github.com/kad-products/rezept-core/commit/f5e213dc4031103499ec476a9da292fefa982762))
* restore worker-configuration.d.ts from main ([cad0112](https://github.com/kad-products/rezept-core/commit/cad0112eeff326dcd60eea2510d0689e5172727c))

### Code Refactoring

* pass logger as parameter to all repository methods ([3fb9e58](https://github.com/kad-products/rezept-core/commit/3fb9e5825038d53d5586ce39ac0d2e70eb76f0c8))

## [1.18.7](https://github.com/kad-products/rezept-core/compare/v1.18.6...v1.18.7) (2026-04-29)

### Bug Fixes

* align forms to explicit type biome rule ([9558837](https://github.com/kad-products/rezept-core/commit/955883754ec93fe30d371ab18b81db00a78b31c9))
* final biome explicit return types ([1fd3831](https://github.com/kad-products/rezept-core/commit/1fd38315fbfb11608f06028f658e7a40dbf4461e))
* more simple return type definitions ([708616e](https://github.com/kad-products/rezept-core/commit/708616ecf6d5f1124bbc7d7cd8b27c56f7f1c94d))
* required types on a lot of basic elements and components ([7823d71](https://github.com/kad-products/rezept-core/commit/7823d717f94f5fa4ad7402b3ccf792099036be58))
* return types for initialize scrape and related method ([0b24e39](https://github.com/kad-products/rezept-core/commit/0b24e39d7b0aeafbbd75b2b56032f42b580bd399))
* type for repository utils ([961a909](https://github.com/kad-products/rezept-core/commit/961a909cdca92c977c33f83b31a6be815c4121ef))
* type for saveRecipeIngredients ([8367744](https://github.com/kad-products/rezept-core/commit/836774471d2a4681964e8ccbf11c2253b54cbf10))
* type of recipe validator ([0969d75](https://github.com/kad-products/rezept-core/commit/0969d7501fe959219308c37e5df7aee2d633dcb4))
* types added to actions, data, and middleware ([6e911bb](https://github.com/kad-products/rezept-core/commit/6e911bb4d9efc65739426877099454278eed7efe))

## [1.18.6](https://github.com/kad-products/rezept-core/compare/v1.18.5...v1.18.6) (2026-04-28)

### Bug Fixes

* add response utils for actions ([c91e52f](https://github.com/kad-products/rezept-core/commit/c91e52faec782401447ec2e0df7ac394dc0b786d))

## [1.18.5](https://github.com/kad-products/rezept-core/compare/v1.18.4...v1.18.5) (2026-04-28)

### Bug Fixes

* api key call return API error structure ([c1ddfa5](https://github.com/kad-products/rezept-core/commit/c1ddfa539abbe7899e97d4c4ba460fcd033802f3))
* more schema namespace-related changes ([493d957](https://github.com/kad-products/rezept-core/commit/493d957f02fc2f2ecccddc126d4fc4ba553aa874))
* throw original error ([c6eae7f](https://github.com/kad-products/rezept-core/commit/c6eae7f4a6403378bf91392b2e8c0dd1f17c85c7))

### Code Refactoring

* schemas managed under namespaces ([186c374](https://github.com/kad-products/rezept-core/commit/186c374ffb1f517291dab4ae38411528ec31e153))

## [1.18.4](https://github.com/kad-products/rezept-core/compare/v1.18.3...v1.18.4) (2026-04-28)

### Bug Fixes

* remove default context for standard layout ([c1afeb4](https://github.com/kad-products/rezept-core/commit/c1afeb4c7ce376e5be19f13bcd9fe2c78ceda974))
* remove unused FormValidationResponse ([a8456b3](https://github.com/kad-products/rezept-core/commit/a8456b31019c78d86931e63068c566d6fab75ccc))
* rule for no console.log in most server-side code ([78e01af](https://github.com/kad-products/rezept-core/commit/78e01af20be8ae303279aedc982b6c232ad17a74))
* use RequestInfo on login page for consistency ([fa33b5c](https://github.com/kad-products/rezept-core/commit/fa33b5c6e9cdac1656595d3a7f43cbf5d6045989))

## [1.18.3](https://github.com/kad-products/rezept-core/compare/v1.18.2...v1.18.3) (2026-04-28)

### Bug Fixes

* swap out react-select for radix select ([1ddbe7e](https://github.com/kad-products/rezept-core/commit/1ddbe7e15d8c6e056e236ceb597f35df62c55915))
* update number and textarea to radix ([4d962e9](https://github.com/kad-products/rezept-core/commit/4d962e90a9f5a338f78afaae4c0a41a3789b2359))
* use form.root in all forms ([53d6286](https://github.com/kad-products/rezept-core/commit/53d62867b510541f3ef42e09c174cd03ab3ce4d5))

## [1.18.2](https://github.com/kad-products/rezept-core/compare/v1.18.1...v1.18.2) (2026-04-28)

### Bug Fixes

* card component no more async ([61ce7c7](https://github.com/kad-products/rezept-core/commit/61ce7c7c36109317047c00bacbc0429d13ccc66c))
* rename component files to match component names ([4c88cfc](https://github.com/kad-products/rezept-core/commit/4c88cfc3e25caeec320caec9a8b60d0a3327317f))

## [1.18.1](https://github.com/kad-products/rezept-core/compare/v1.18.0...v1.18.1) (2026-04-27)

### Bug Fixes

* import to upload change in wrangler for integration ([2ae0957](https://github.com/kad-products/rezept-core/commit/2ae095789c46ea259a8d40c24dcdaf1c9d3cb61a))

## [1.18.0](https://github.com/kad-products/rezept-core/compare/v1.17.1...v1.18.0) (2026-04-27)

### Features

* claude command for an audit ([0833929](https://github.com/kad-products/rezept-core/commit/0833929e66cbdd2ba3cc2365647281d9be1daa75))

### Bug Fixes

* remove old claude notes ([af04b0d](https://github.com/kad-products/rezept-core/commit/af04b0de3d288bd1da7fe3d0b2f1ede5e24eaf3b))

### Code Refactoring

* clean up components structure ([79c40c5](https://github.com/kad-products/rezept-core/commit/79c40c5f0e596fe9eee8491eee89aea88629d4ba))
* move session to durable-storage ([8647ea1](https://github.com/kad-products/rezept-core/commit/8647ea11831aa5b85bf39f8a3320acb4c2be6dd1))
* put utils in specific use case directories ([7f54472](https://github.com/kad-products/rezept-core/commit/7f5447224b44580cb9d11b8f6bb5ca586425f714))

## [1.17.1](https://github.com/kad-products/rezept-core/compare/v1.17.0...v1.17.1) (2026-03-22)

### Bug Fixes

* use mode to find the right base url setting in builds ([8089355](https://github.com/kad-products/rezept-core/commit/8089355c3e3d6266e9559e0acfbe59dca43ff2b4))

## [1.17.0](https://github.com/kad-products/rezept-core/compare/v1.16.0...v1.17.0) (2026-03-22)

### Features

* add code to handle raw vs explicit props for ingredients ([a96f239](https://github.com/kad-products/rezept-core/commit/a96f23967885e99ab7a44f2201b7cfd1cc368a74))
* add initial scrapes table and related processing logic ([9fb87c6](https://github.com/kad-products/rezept-core/commit/9fb87c64931f722239613006d1934e392f4543a8))
* add raw record in db table for recipe ingredient ([5e48ec2](https://github.com/kad-products/rezept-core/commit/5e48ec281368b49fdb06e48d73c5d7f3128c2915))
* add require auth interrupter ([9ef1196](https://github.com/kad-products/rezept-core/commit/9ef1196c61a818003a63e7c4ed0992c537b1a729))
* add validation to bookmarklet import data ([d0421a4](https://github.com/kad-products/rezept-core/commit/d0421a4a867617668011306a405c09d8a97182f1))
* adding initial functioning scrape api and flow ([142323a](https://github.com/kad-products/rezept-core/commit/142323a23e0854c16fb2d1e9ac6a7ef6cd9fdc5d))
* break up recipe imports to uploads and scrapes ([1ea67eb](https://github.com/kad-products/rezept-core/commit/1ea67eb6c88bf7eb1e2d463d0345bb9023142db4))
* logger can handle objects now ([9194319](https://github.com/kad-products/rezept-core/commit/919431921bf308190e7e9658eb91373a826b658d))
* make cors middleware handle more cors things ([9e4b141](https://github.com/kad-products/rezept-core/commit/9e4b141d6203ee34ce652ad6cb3dbc30362f334c))
* working local tunnel setup for bookmarklet testing ([9a31ec7](https://github.com/kad-products/rezept-core/commit/9a31ec77850f09b521b3ade4ccf6c34b3b36a000))

### Bug Fixes

* fail step when branch protection can't be disabled ([9a0ce43](https://github.com/kad-products/rezept-core/commit/9a0ce4377cd26792a8f8b916d24753b7aa2505a3))
* get cors middleware working again ([5d833e0](https://github.com/kad-products/rezept-core/commit/5d833e058fb0b155702feb2a973c5d8b06e0b4e8))
* optional uuid handle nulls ([6ddaf6f](https://github.com/kad-products/rezept-core/commit/6ddaf6f731c1b8a970b785ee632ebcdbc9eaab0d))
* recipe schema remove nulls for id type ([20cde84](https://github.com/kad-products/rezept-core/commit/20cde84598d009e7a5b21d7bfde82b7d22ea622c))
* rename API files and define a clearer pattern ([404c7ef](https://github.com/kad-products/rezept-core/commit/404c7ef99e5b1291a8b70d4b5df898c36886b472))
* use response.json for most handlers ([02c170f](https://github.com/kad-products/rezept-core/commit/02c170f561ebfbf6159d779260b4a196eacefe81))

### Code Refactoring

* move recipe uploads and scrapes to live under imports namespace ([de66c45](https://github.com/kad-products/rezept-core/commit/de66c45761856f59af7a1c4d466ba138e02435bc))
* rename auth middleware to session middleware ([6004362](https://github.com/kad-products/rezept-core/commit/6004362fd350cc7f66bf349fbd0817b42ec15395))

## [1.16.0](https://github.com/kad-products/rezept-core/compare/v1.15.1...v1.16.0) (2026-03-15)

### Features

* initial parsing of bookmarklet recipe data ([916ddfd](https://github.com/kad-products/rezept-core/commit/916ddfd09b288985153428c591d6c06f58549e6a))

## [1.15.1](https://github.com/kad-products/rezept-core/compare/v1.15.0...v1.15.1) (2026-03-15)

### Bug Fixes

* cors middleware allow auth header ([218298f](https://github.com/kad-products/rezept-core/commit/218298fa3a042a91b7301671be138a8713cbaa92))

## [1.15.0](https://github.com/kad-products/rezept-core/compare/v1.14.0...v1.15.0) (2026-03-15)

### Features

* adding cors middleware ([b263704](https://github.com/kad-products/rezept-core/commit/b26370431f4e19f7b95e1211a40892967fa8809e))

## [1.14.0](https://github.com/kad-products/rezept-core/compare/v1.13.0...v1.14.0) (2026-03-15)

### Features

* add getApiKeyByKey for handling API key-based calls ([d46fa74](https://github.com/kad-products/rezept-core/commit/d46fa74af6430f0cb2c689e1a3f2b7c25265a963))
* adding api call handling to the request path ([8f6d0c6](https://github.com/kad-products/rezept-core/commit/8f6d0c6c19a84a571e2a30290b311389f36d3831))
* enable copying of API keys from profile ([204d02f](https://github.com/kad-products/rezept-core/commit/204d02f3d913a478709dd4b8e4d30d2a4ea0e711))

### Bug Fixes

* changing APIKey to ApiKey for consistency ([6b8e5e9](https://github.com/kad-products/rezept-core/commit/6b8e5e955784705db69a130968b8caa2414af017))

## [1.13.0](https://github.com/kad-products/rezept-core/compare/v1.12.0...v1.13.0) (2026-03-15)

### Features

* adding api keys for users ([2130ecd](https://github.com/kad-products/rezept-core/commit/2130ecd87717c53a52a46bcb74f9dd0e4ee77d55))

### Bug Fixes

* remove all the bookmarklet stuff ([57d9a07](https://github.com/kad-products/rezept-core/commit/57d9a074ee5a3890b9a077b13c49381f344edb49))

## [1.12.0](https://github.com/kad-products/rezept-core/compare/v1.11.5...v1.12.0) (2026-03-14)

### Features

* custom cookie to enable bookmarklet calls ([0e013ee](https://github.com/kad-products/rezept-core/commit/0e013eed79f99cf6ee3390e520d53842fa448ee2))

### Bug Fixes

* permission for profile viewing ([9fe04de](https://github.com/kad-products/rezept-core/commit/9fe04de811f47ddd82e865a3c37a0c8754b2c941))

## [1.11.5](https://github.com/kad-products/rezept-core/compare/v1.11.4...v1.11.5) (2026-03-14)

## [1.11.4](https://github.com/kad-products/rezept-core/compare/v1.11.3...v1.11.4) (2026-03-14)

### Bug Fixes

* remove middleware for bookmarklet ([8f8fc71](https://github.com/kad-products/rezept-core/commit/8f8fc71a1b160605867394584480d384e3128470))

## [1.11.3](https://github.com/kad-products/rezept-core/compare/v1.11.2...v1.11.3) (2026-03-14)

### Bug Fixes

* adding logging for the middleware on options ([60c8c2a](https://github.com/kad-products/rezept-core/commit/60c8c2a913e2f99ff2a62a6a98ef1df034ecb98f))

## [1.11.2](https://github.com/kad-products/rezept-core/compare/v1.11.1...v1.11.2) (2026-03-14)

### Bug Fixes

* adding more bookmarklet logic ([11c45d2](https://github.com/kad-products/rezept-core/commit/11c45d2ffee40bc57da1041686499ca679ac3b81))

## [1.11.1](https://github.com/kad-products/rezept-core/compare/v1.11.0...v1.11.1) (2026-03-14)

### Bug Fixes

* typo in bookmarklet import path ([f861e15](https://github.com/kad-products/rezept-core/commit/f861e15df8c6942bff3a175c259e3b761ff98a22))

## [1.11.0](https://github.com/kad-products/rezept-core/compare/v1.10.1...v1.11.0) (2026-03-14)

### Features

* default users to BASIC role ([10d63b1](https://github.com/kad-products/rezept-core/commit/10d63b188b3ec9d52b85421fa114e769cf5014a6))
* initial bookmarklet endpoint ([7fea249](https://github.com/kad-products/rezept-core/commit/7fea249687a570274250e4a8137f85c71194c77e))
* move recipe listing and imports into tabs ([3e49972](https://github.com/kad-products/rezept-core/commit/3e49972541a07f36e20ca1890564902b72b5a369))
* move to radix icons ([0540905](https://github.com/kad-products/rezept-core/commit/0540905366ef34fd348070223247acfc42f2e2f0))
* radix theme and light/dark modes ([b50ec3a](https://github.com/kad-products/rezept-core/commit/b50ec3ad755d44b6f06f121cd51efc5b025c7521))

### Bug Fixes

* add auth perms ([4ad47f6](https://github.com/kad-products/rezept-core/commit/4ad47f60b48a7737d74e55907e608e26bb02eeee))

## [1.10.1](https://github.com/kad-products/rezept-core/compare/v1.10.0...v1.10.1) (2026-02-26)

### Bug Fixes

* **ci:** run migrations in release process ([57e9744](https://github.com/kad-products/rezept-core/commit/57e9744079b4c90099f1d3111be64dd8e66d6fbc))

## [1.10.0](https://github.com/kad-products/rezept-core/compare/v1.9.2...v1.10.0) (2026-02-26)

### Features

* use a more accurate variable name for session encryption ([aff2343](https://github.com/kad-products/rezept-core/commit/aff2343c02472bf04bf915ea20baf6fee8fa11e1))

### Bug Fixes

* remove references to old web authn RP ID ([66eb225](https://github.com/kad-products/rezept-core/commit/66eb225e98eede9b74dc2a22288ffc95014bbd53))

## [1.9.2](https://github.com/kad-products/rezept-core/compare/v1.9.1...v1.9.2) (2026-02-26)

### Bug Fixes

* conditionally render tanstack devtools ([7d7c6bd](https://github.com/kad-products/rezept-core/commit/7d7c6bdb9c1503efb88c54905de7b9379808c1e5))
* do iso country codes without importing the package ([92eb02b](https://github.com/kad-products/rezept-core/commit/92eb02b527f450ea6172433829b7dc53a5a0601f))

## [1.9.1](https://github.com/kad-products/rezept-core/compare/v1.9.0...v1.9.1) (2026-02-26)

### Bug Fixes

* environment structure in wrangler config ([b57a7a1](https://github.com/kad-products/rezept-core/commit/b57a7a109129d5c5d5003acfde41e723ad796165))
* remove wrangler dry run ([d364e46](https://github.com/kad-products/rezept-core/commit/d364e4671c9eafb9f9f1955eb6f7754347cb994d))

## [1.9.0](https://github.com/kad-products/rezept-core/compare/v1.8.0...v1.9.0) (2026-02-25)

### Features

* add the TF for provisioning integration environment ([e0663a0](https://github.com/kad-products/rezept-core/commit/e0663a0b4f4667a48c51982e42ad6ad773125411))
* release setup and docs for integration environment ([41ca4a6](https://github.com/kad-products/rezept-core/commit/41ca4a6510d32c051c945cb4919f62f2549c2a55))

### Bug Fixes

* ignore tf vars files ([df100b1](https://github.com/kad-products/rezept-core/commit/df100b13e72e37291246e200974f47c1bb60275a))

### Code Refactoring

* prep wrangler file for the integration release ([0120b3e](https://github.com/kad-products/rezept-core/commit/0120b3e32f7f5057969d097cd3877c9df5780a36))

## [1.8.0](https://github.com/kad-products/rezept-core/compare/v1.7.0...v1.8.0) (2026-02-25)

### Features

* view recipe import details ([a1e13a7](https://github.com/kad-products/rezept-core/commit/a1e13a7f5e827a18c7c4f068253c598c27019916))

## [1.7.0](https://github.com/kad-products/rezept-core/compare/v1.6.1...v1.7.0) (2026-02-24)

### Features

* add recipe imports model, types, and migration ([9e2876f](https://github.com/kad-products/rezept-core/commit/9e2876f3a25282a33e518ca9a6697aead91c136a))
* break up permissions to allow for non-cyclical dependencies ([71e4eb4](https://github.com/kad-products/rezept-core/commit/71e4eb487e9a32f8b1de001e472b8bc9907890f6))
* initial API for uploading recipe imports ([5115918](https://github.com/kad-products/rezept-core/commit/51159182ba2c869bb7ceee945d339ff8d90e40ec))
* recipe import form ([5c5f46a](https://github.com/kad-products/rezept-core/commit/5c5f46a307d08df082505de7f344d28405d813d2))

### Bug Fixes

* added "bot detection" middleware that mostly just stop react devtools ([916d917](https://github.com/kad-products/rezept-core/commit/916d91701ee55109511055026e7c4cd0446d512e))
* adjustments for CSP blob handling for file upload processing/preview ([24bd46a](https://github.com/kad-products/rezept-core/commit/24bd46a402aeb79d2da9b94d54f691c249d431c8))

## [1.6.1](https://github.com/kad-products/rezept-core/compare/v1.6.0...v1.6.1) (2026-02-23)

### Bug Fixes

* align erd to latest table models ([0884d53](https://github.com/kad-products/rezept-core/commit/0884d533549803731eb07a8c91c3c7680b0ef057))

## [1.6.0](https://github.com/kad-products/rezept-core/compare/v1.5.0...v1.6.0) (2026-02-23)

### Features

* add initial version of logger middleware ([98b3939](https://github.com/kad-products/rezept-core/commit/98b39396a152fb80b66adb444650b3fac04dcf29))

## [1.5.0](https://github.com/kad-products/rezept-core/compare/v1.4.0...v1.5.0) (2026-02-22)

### Features

* permissions in the recipe and season page nav ([85c3c83](https://github.com/kad-products/rezept-core/commit/85c3c83d4ae57135253fc975996bdcdbb6c3808e))

### Bug Fixes

* align recipe lookup by id to standard pattern ([f3034a7](https://github.com/kad-products/rezept-core/commit/f3034a79a4641406eda0b1cc20fbb73c24d0c16f))
* validate uuids in repository methods ([7f623ab](https://github.com/kad-products/rezept-core/commit/7f623ab5f32003adfe1932b16155af1dbfc22ba2))

## [1.4.0](https://github.com/kad-products/rezept-core/compare/v1.3.3...v1.4.0) (2026-02-22)

### Features

* add initial roles and permissions to the site ([f34b9c5](https://github.com/kad-products/rezept-core/commit/f34b9c5e361ffaea00a2f07af6df78a765116b74))
* add permissions and roles for users ([dadbbae](https://github.com/kad-products/rezept-core/commit/dadbbaee5e76dea1e60cfba79a9e7f77f6247fdf))
* enable strict mode in react ([43394e0](https://github.com/kad-products/rezept-core/commit/43394e0feb71fe3dfce7e4a05f76854cc832e42a))

### Bug Fixes

* handle recipe client-side validation a llittle better ([bd558fc](https://github.com/kad-products/rezept-core/commit/bd558fc39486f1aaa3e2242f3753a9b3d610ffec))
* have input fields handle null conversion to empty strings ([ed7f31b](https://github.com/kad-products/rezept-core/commit/ed7f31b24e804d9905f45ccf42ee5a1f2bd86bf1))

## [1.3.3](https://github.com/kad-products/rezept-core/compare/v1.3.2...v1.3.3) (2026-02-21)

### Code Refactoring

* merge user creds table into page ([fc51b9d](https://github.com/kad-products/rezept-core/commit/fc51b9d5b4200062f839a3748d026ab538b85078))

## [1.3.2](https://github.com/kad-products/rezept-core/compare/v1.3.1...v1.3.2) (2026-02-21)

### Bug Fixes

* manual validation of recipe to avoid TS errors for now ([65f1ccc](https://github.com/kad-products/rezept-core/commit/65f1ccca9c9a923ecc7c5e4393aa578c98313d8d))
* merge user creds table into profile page ([59a1f4a](https://github.com/kad-products/rezept-core/commit/59a1f4aef20641a5e37a55a50a71a799704ac825))
* remove recipe server components ([72fc21f](https://github.com/kad-products/rezept-core/commit/72fc21f923c9495b3b7876f6361cd24403954b1f))
* return recipe not found error ([b15711e](https://github.com/kad-products/rezept-core/commit/b15711e2a3ea4f3a3fb04639a7bb03aaa6eb75df))

### Code Refactoring

* remove unused code ([d1eaae3](https://github.com/kad-products/rezept-core/commit/d1eaae365e9d54bb9cf7d9fa6ddab493cea441ea))

## [1.3.1](https://github.com/kad-products/rezept-core/compare/v1.3.0...v1.3.1) (2026-02-21)

### Bug Fixes

* merge season view component into view page ([bd0788f](https://github.com/kad-products/rezept-core/commit/bd0788f982829a08b11378ee0467d24d7647b699))
* remove debugging from season form ([0ea4dbc](https://github.com/kad-products/rezept-core/commit/0ea4dbc0f17cdc3c9059deaeb26af8de15b7738c))
* return error if season is not found ([0693bcb](https://github.com/kad-products/rezept-core/commit/0693bcbec002d3a4edd118aecebf88ec9d2e578c))

### Code Refactoring

* move season server components to pages ([364841c](https://github.com/kad-products/rezept-core/commit/364841ccdf72d4c97ec51c70c13be154928bfad6))

## [1.3.0](https://github.com/kad-products/rezept-core/compare/v1.2.1...v1.3.0) (2026-02-21)

### Features

* remove lists and list items from DB ([f1d0e7a](https://github.com/kad-products/rezept-core/commit/f1d0e7a620e2a8a39cb939ae285aeb30c6c5b95c))

## [1.2.1](https://github.com/kad-products/rezept-core/compare/v1.2.0...v1.2.1) (2026-02-21)

### Bug Fixes

* remove list items and lists ([de09943](https://github.com/kad-products/rezept-core/commit/de09943740d217ab22d9d76e681ec8cb222e9573))

## [1.2.0](https://github.com/kad-products/rezept-core/compare/v1.1.4...v1.2.0) (2026-02-21)

### Features

* add form context for the TanStack implementation ([4c9faaf](https://github.com/kad-products/rezept-core/commit/4c9faaf02c8564bcaf4a75eadbff4f8ed660ec26))
* **dx:** enable the tanstack devtools and form plugin ([826628d](https://github.com/kad-products/rezept-core/commit/826628d938596c5a49500d277ec9e813dcf663b9))
* refactor recipe form into tanstack ([8ffbdd0](https://github.com/kad-products/rezept-core/commit/8ffbdd03a9a9f575f61361fa3ff3c55cf730676a))

### Bug Fixes

* inputs handle on blur ([7fad73b](https://github.com/kad-products/rezept-core/commit/7fad73bb49388eb3cdc598589957b5263cfbabcb))
* less debugging on form jsx ([023072c](https://github.com/kad-products/rezept-core/commit/023072ceeee2b5c2b016f175379b55567c5bcb77))
* no audit fields in season schemas ([3d27ccf](https://github.com/kad-products/rezept-core/commit/3d27ccfe8c063366e384f56cace11c488169a19b))
* simplify the DB mocking approach ([e658efc](https://github.com/kad-products/rezept-core/commit/e658efc1fd8cc32cbfda07ac8b149662e9cefaa4))

### Code Refactoring

* move i18n-iso-countries to a countries data module ([aa212e7](https://github.com/kad-products/rezept-core/commit/aa212e7d8e7de6d0a91f6faaf5835636c388579d))
* move months to a data file ([ec6fe9c](https://github.com/kad-products/rezept-core/commit/ec6fe9cd946df4945fd1c2878e234050d14b25aa))
* remove list items form and actions ([bf54111](https://github.com/kad-products/rezept-core/commit/bf5411168a4cf1a625b3d73a972f1d9942b14778))
* remove lists from nav ([f3ce6b9](https://github.com/kad-products/rezept-core/commit/f3ce6b9f535b5b69d428600316f2ab55aabd06c6))
* remove more list related items ([32d9d23](https://github.com/kad-products/rezept-core/commit/32d9d2351289233e4ebe9a7605dca624112b5ad4))
* rename testable DB to better name ([959c1c2](https://github.com/kad-products/rezept-core/commit/959c1c2087da5deaebf96a65c25a41017bfe20ca))

## [1.1.4](https://github.com/kad-products/rezept-core/compare/v1.1.3...v1.1.4) (2026-02-17)

### Bug Fixes

* reenable the same protections we have in TF ([2914189](https://github.com/kad-products/rezept-core/commit/2914189df5095aa64c94ed016a0f274cd267248c))

## [1.1.3](https://github.com/kad-products/rezept-core/compare/v1.1.2...v1.1.3) (2026-02-17)

### Bug Fixes

* use default context pattern ([e64411e](https://github.com/kad-products/rezept-core/commit/e64411ec3067feef1aec6bd113afb4a56a2f4125))

### Code Refactoring

* move headers and user middleware and add tests ([ebd5b2a](https://github.com/kad-products/rezept-core/commit/ebd5b2aaf719e26af9bff1986ee9aeba421e11af))

## [1.1.2](https://github.com/kad-products/rezept-core/compare/v1.1.1...v1.1.2) (2026-02-17)

### Bug Fixes

* add missing package for release notes ([1ffbe89](https://github.com/kad-products/rezept-core/commit/1ffbe89328529cf0b16facc70f903c487c352872))
* fixes needed based on what action tests found ([7a5b015](https://github.com/kad-products/rezept-core/commit/7a5b01593245d945f886313ee02f4d5f70f57d56))
* get actions aligned to new schemas ([f4e91d5](https://github.com/kad-products/rezept-core/commit/f4e91d5c9b5c765ece93c0c60d771a0a3209895d))
* get tests and form signatures aligned ([8edbdef](https://github.com/kad-products/rezept-core/commit/8edbdef6765031241aed228de0f5759033c55468))
* leave updatedAt empty upon insert ([784e3c3](https://github.com/kad-products/rezept-core/commit/784e3c39805d8c8d6f8532685dd8fa7f2bf55a3c))
* location of semantic release config file ([a90419d](https://github.com/kad-products/rezept-core/commit/a90419db8baeb6426934468b0b5dfed0b30aaaa5))
* session management tweaks ([83efd20](https://github.com/kad-products/rezept-core/commit/83efd20bf79341afcc9b513a54417c437e1c476a))

### Code Refactoring

* import all db schemas from schema file ([8aa9dfd](https://github.com/kad-products/rezept-core/commit/8aa9dfde4e8aa3dece72aa7b4c856a4969ec31b6))
* move DB types into types folder ([0206339](https://github.com/kad-products/rezept-core/commit/0206339d3f17857a3852f7e193e08b38cdd15b1b))
* move form validation type to the right place ([34cd4d3](https://github.com/kad-products/rezept-core/commit/34cd4d30d819b7c9bc26ad7cb396bb5a1f1f0486))
* move functions to actions ([656a2ac](https://github.com/kad-products/rezept-core/commit/656a2ac09ca59d8ca9b4886919ca283c99f1dad8))
* rename models index file to index ([59b7505](https://github.com/kad-products/rezept-core/commit/59b7505f8ef36de12d70dcc3de8d97c6aae0084f))
* schemas moved to schema directory ([ddd1830](https://github.com/kad-products/rezept-core/commit/ddd183069b4139666d7bb43dda48a9538006eefd))
