var jaws = (function(jaws) {

/* 
 * _Asset
 *
 * Provides a one-stop access point to all assets (images, sound, video)
 *
 * exposed as jaws.assets
 * 
 */
Asset = function() {
  this.list = []
  this.data = []
  that = this

  this.file_type = {}
  this.file_type["wav"] = "audio"
  this.file_type["mp3"] = "audio"
  this.file_type["ogg"] = "audio"
  this.file_type["png"] = "image"
  this.file_type["jpg"] = "image"
  this.file_type["jpeg"] = "image"
  this.file_type["bmp"] = "image"
  var that = this

  this.length = function() {
    return this.list.length
  }

  this.add = function(src) {
    this.list.push({"src": src})
    return this
  }
  /* 
   * Get one or many resources
   *
   * @param   String or Array of strings
   * @returns The raw resource or an array of resources
   *
   * */
  this.get = function(src) {
    if(jaws.isArray(src)) {
      return src.map( function(i) { return that.data[i] } )
    }
    else {
      return this.data[src]
    }
  }
  
  this.getType = function(src) {
    postfix_regexp = /\.([a-zA-Z]+)/;
    postfix = postfix_regexp.exec(src)[1]
    return (this.file_type[postfix] ? this.file_type[postfix] : postfix)
  }
  
  this.loadAll = function(options) {
    this.loadedCount = 0

    /* With these 2 callbacks you can display progress and act when all assets are loaded */
    if(options) {
      this.loaded_callback = options.loaded
      this.loading_callback = options.loading
    }

    for(i=0; this.list[i]; i++) {
      var asset = this.list[i]
        
      switch(this.getType(asset.src)) {
        case "image":
          var src = asset.src + "?" + parseInt(Math.random()*10000000)
          asset.image = new Image()
          asset.image.asset = asset
          asset.image.onload = this.imageLoaded
          asset.image.src = src
          break;
        case "audio":
          var src = asset.src + "?" + parseInt(Math.random()*10000000)
          asset.audio = new Audio(src)
          asset.audio.asset = asset
          this.data[asset.src] = asset.audio
          asset.audio.addEventListener("canplay", this.audioLoaded, false);
          asset.audio.load()
          break;
        default:
          var src = asset.src + "?" + parseInt(Math.random()*10000000)
          var req = new XMLHttpRequest()
          req.open('GET', src, false)
          req.send(null)
          if(req.status == 200) {
            this.data[asset.src] = this.parseAsset(asset.src, req.responseText)
            this.itemLoaded(asset.src)
          }
          break;
      }
    }
  }

  this.parseAsset = function(src, data) {
    switch(this.getType(src)) {
      case "json":
        return JSON.parse(data)
      default:
        return data
    }
  };

  this.itemLoaded = function(src) {
    this.loadedCount++
    var percent = parseInt(this.loadedCount / this.list.length * 100)
    if(this.loading_callback) { this.loading_callback(src, percent) }
    if(this.loaded_callback && percent==100) { this.loaded_callback() } 
  };

  this.imageLoaded = function(e) {
    var asset = this.asset
    that.data[asset.src] = asset.image
    that.itemLoaded(asset.src)
  };
  
  this.audioLoaded = function(e) {
    var asset = this.asset
    that.data[asset.src] = asset.audio
    
    asset.audio.removeEventListener("canplay", that.audioLoaded, false);
    that.itemLoaded(asset.src)
  };
}
jaws.assets = new Asset()


return jaws;
})(jaws || {});
