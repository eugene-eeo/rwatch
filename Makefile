debug:
	mkdir -p build
	cat ext/*.js src/*.js > build/out.js
	cat css/*.css         > build/out.css

release: debug
	cat build/out.js | uglifyjs -mc > build/out.min.js
	mv build/out.min.js build/out.js
	minify --output build/out.css css/*.css

deploy: release
	mkdir -p        ~/code/website/rwatch
	cp ./index.html ~/code/website/rwatch/index.html
	cp -r ./build   ~/code/website/rwatch
