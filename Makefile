
VERSION=0.9
PKG=Soundswitch@developer.beheh.de

deploy: Soundswitch-$(VERSION).zip

Soundswitch-$(VERSION).zip: metadata.json extension.js
	zip Soundswitch-$(VERSION).zip metadata.json extension.js

