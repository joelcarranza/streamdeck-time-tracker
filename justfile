

# create a package
build:
	npx streamdeck pack src/com.joelcarranza.time-tracker.sdPlugin

# install elgato CLI
setup:
	npm install @elgato/cli@latest
	
# install development version into streamdeck
link:
	npx streamdeck streamdeck link src/com.joelcarranza.time-tracker.sdPlugin/
