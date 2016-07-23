if (module && module.hot) {
  module.hot.accept()
}

export function localParam (search, hash) {
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
