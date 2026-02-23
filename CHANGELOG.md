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
