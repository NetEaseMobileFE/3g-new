if (module && module.hot) {
  module.hot.accept()
}

export const isAndroid = navigator.userAgent.match(/android/ig)
export const isIos = navigator.userAgent.match(/iphone|ipod|ipad/ig)
export const isIos9 = navigator.userAgent.match(/iPhone OS 9/i)
export const isNewsapp = navigator.userAgent.match(/NewsApp/ig)
export const isWeixin = navigator.userAgent.match(/micromessenger/ig)
export const isWeibo = navigator.userAgent.match(/weibo/ig)
export const isYixin = navigator.userAgent.match(/yixin/ig)
export const isQQ = navigator.userAgent.match(/qq/gi)

export function localParam(search, hash) {
  const _search = search || window.location.search
  const _hash = hash || window.location.hash
  let fn = (str, reg) => {
    let data = {}
    if (str) {
      str.replace(reg, ($0, $1, $2, $3) => {
        data[$1] = $3
      })
      return data
    }
  }
  return {
    search: fn(_search, new RegExp('([^?=&]+)(=([^&]*))?', 'g')) || {},
    hash: fn(_hash, new RegExp('([^#=&]+)(=([^&]*))?', 'g')) || {}
  }
}

export function optImage(url, width, height) {
  let image = url || 'http://img1.cache.netease.com/3g/img11/3gtouch13/imglist.png'
  if (!!image.match(/nos/)) {
    if (!image.match(/\?/)) {
      image += `?imageView&thumbnail=${width}x${height || 10000}&quality=50`
    } else {
      image += `&thumbnail=${width}x${height || 10000}&quality=50`
    }
  } else {
    image = `http://s.cimg.163.com/i/${image.replace('http://', '')}.${width}x${height || 10000}.75.auto.jpg`
  }
  return image
}


export function simpleParse(tpl, values) {
  if (values) {
    return String(tpl).replace(/<#=(\w+)#>/g, (function($1, $2) {
      if (values[$2] !== null) {
        return values[$2]
      } else {
        return $1
      }
    }))
  } else {
    return tpl
  }
}

export function importJs(a,b,c) {let d=document.createElement("script");d.src=a,c&&(d.charset=c),d.onload=function(){this.onload=this.onerror=null,this.parentNode.removeChild(this),b&&b(!0)},d.onerror=function(){this.onload=this.onerror=null,this.parentNode.removeChild(this),b&&b(!1)},document.head.appendChild(d)}

export function getCookie(sKey) {
  return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
}

export function ajax(option) {
  var data, dataType, key, method, request;
  if (!option.url) {
    throw new Error('Need for url');
  }
  dataType = option.dataType || 'text';
  method = option.method || 'GET';
  data = '';
  if (!!option.data && typeof option.data !== 'string') {
    for (key in option.data) {
      data += key + "=" + option.data[key] + "&";
    }
    data = data.slice(0, data.length - 1);
  } else {
    data = option.data;
  }
  request = new XMLHttpRequest();
  request.open(method, option.url, true);
  if (method.toUpperCase() === 'POST') {
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
  }
  request.onload = function() {
    var result;
    if (request.status >= 200 && request.status < 400) {
      if (dataType.toUpperCase() === 'JSON') {
        result = JSON.parse(request.responseText);
      }
      if (typeof option.success === "function") {
        option.success(result);
      }
    } else {
      if (typeof option.error === "function") {
        option.error();
      }
    }
  };
  request.send(data);
}

/**
 * [四舍五入保留n位小数]
 * @param  {[type]} dight [需要格式化的数]
 * @param  {[type]} dot   [保留的小数位]
 */
export function forDight(dight, dot) {
  dight = Math.round(dight * Math.pow(10, dot)) / Math.pow(10, dot)
  return dight
}

/**
 * [格式化时间]
 * @param  {[time]} time [description]
 */
export function formatTime(time) {
  let date = null

  if(typeof time == 'number'){
    date = time
  }else{
    const arr = time.split(/[- :]/)
    date = +new Date(arr[0], arr[1]-1, arr[2], arr[3], arr[4], arr[5])
  }
  time = new Date(time)
  const now = Date.now()
  const distance = {
    day: Math.floor((now - date) / (1000*60*60*24)),
    hour: Math.floor((now - date) / (1000*60*60)),
    minute: Math.floor((now - date) / (1000*60))
  }
  if(distance.day > 0){
    if(distance.day === 1){
      return '1天前'
    }else{
      return `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`
    }
  }else if(distance.hour > 0){
    return distance.hour + '小时前'
  }else{
    return (distance.minute || 1) + '分钟前'
  }
}

// 判断对象是否存在或为空
export function isOwnEmpty(obj) {
  for(var name in obj) {
    if(obj.hasOwnProperty(name)) {
      return false;
    }
  }
  return true;
}

// 格式化跟帖数
export function round(num) {
  if (num > 10000) {
    return `${Math.round(num / 9999 * Math.pow(10, 1)) / Math.pow(10, 1)}万`
  } else {
    return num
  }
}

export function timeFormat(t) {
  let m = Math.floor(t / 60)
  let s = t % 60
  m = m < 10 ? `0${m}` : m
  s = s < 10 ? `0${s}` : s
  return `${m}:${s}`
}

export const assign = Object.assign || function(target) {
  if (target == null) {
    throw new TypeError('Cannot convert undefined or null to object')
  }
  target = Object(target)
  for (var index = 1; index < arguments.length; index++) {
    var source = arguments[index]
    if (source != null) {
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key]
        }
      }
    }
  }
  return target
}
