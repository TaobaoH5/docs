#!/usr/bin/env node
var hogan = require('hogan.js')
  , fs    = require('fs')
  , path  = require('path')
  , prod  = process.argv[2] == 'production'
  , title = 'Taobao H5'
  , templatePath = '../templates'
  , pagesPath = 'pages'
  , hoganOpt = { sectionTags: [{o:'_i', c:'i'}] }

var layout, pages, components

// compile layout template
layout = fs.readFileSync(path.join(__dirname, templatePath, 'layout.mustache'), 'utf-8')
layout = hogan.compile(layout, hoganOpt)

compLayout = fs.readFileSync(path.join(__dirname, templatePath, 'compLayout.mustache'), 'utf-8')
compLayout = hogan.compile(compLayout, hoganOpt)

// retrieve pages
pages = fs.readdirSync(path.join(__dirname, templatePath, pagesPath))

// iterate over pages
pages.forEach(function (name) {

  if (!name.match(/([^.]+)\.mustache$/)) return

  var page = fs.readFileSync(path.join(__dirname, templatePath, pagesPath, name), 'utf-8')
    , includePage = fs.readFileSync(path.join(__dirname, templatePath, pagesPath, name), 'utf-8')
    , context = {}
  
    , includes = page.match(/\{\{\>[^>{}]+\}\}/ig)
  
  // include sub pages
  includes && includes.length &&
	  includes.forEach(function(name) {
	  	name = name.replace(/\{\{\>([^>{}]+)\}\}/ig,  '$1')
	  	try {
	  		var ipage = fs.readFileSync(path.join(__dirname, templatePath, pagesPath, name + '.mustache'), 'utf-8')
	  	} catch(e) {
	  		console.log(e.message)
	  	}
      
      page = page.replace('{{>' + name + '}}', ipage || '')

      if (name.match(/^component/ig)){
        ipage = hogan.compile(ipage, hoganOpt)
        ipage = compLayout.render({_i : true, production : prod}, {body:ipage})
        fs.writeFileSync(path.join(__dirname, '/../', name.replace(/^component/, 'components') + '.html'), ipage, 'utf-8')			
      }
	  })


  context[name.replace(/\.mustache$/, '')] = 'active'
  context._i = true
  context.production = prod
  context.title = name
    .replace(/\.mustache/, '')
    .replace(/\-.*/, '')
    .replace(/(.)/, function ($1) { return $1.toUpperCase() })

  if (context.title == 'Index') {
    context.title = title
  } else {
    context.title += ' · ' + title
  }

  page = hogan.compile(page, hoganOpt)
  page = layout.render(context, {
    body: page
  })

  fs.writeFileSync(__dirname + '/../' + name.replace(/mustache$/, 'html'), page, 'utf-8')
})