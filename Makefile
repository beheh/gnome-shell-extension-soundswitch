
VERSION=0.8
PKG=Soundswitch@developer.beheh.de

deploy: Soundswitch-$(VERSION).zip

Soundswitch-$(VERSION).zip: metadata.json extension.js locale/de/LC_MESSAGES/Soundswitch@developer.beheh.de
	zip Soundswitch-$(VERSION).zip metadata.json extension.js locale/de/LC_MESSAGES/Soundswitch@developer.beheh.de

