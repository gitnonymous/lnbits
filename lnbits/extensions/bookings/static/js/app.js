function fragment(string){
    let d = document.createElement('div')
    d.innerHTML = string
  return d.children[0]
}

