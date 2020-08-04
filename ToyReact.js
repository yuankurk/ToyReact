//html elements, div, span, etc
class ElementWrapper {
    constructor(type){
        this.root = document.createElement(type)
    }
    setAttribute(name, value){
        //event-handling
        if(name.match(/^on([\s\S]+)$/)){
            let eventName = RegExp.$1.replace(/^[\s\S]/, s=>s.toLowerCase())
            // console.log(eventName)
            this.root.addEventListener(eventName, value)
        }
        this.root.setAttribute(name, value)
    }
    appendChild(vchild){
        vchild.mountTo(this.root)
    }
    mountTo(parent){
        parent.appendChild(this.root)
    }
}

//html strings. in react native, must be <Text>blabla</Text>
//only occurs as children, not type(createElement)
class TextWrapper {
    constructor(content){
        this.root = document.createTextNode(content)
    }
    mountTo(parent){
        parent.appendChild(this.root)
    }
}
export class Component {
    constructor(){
        this.children = []
        this.props = Object.create(null) //clean
    }
    setAttribute(name, value){
        this.props[name] = value
        this[name] = value
    }
    mountTo(parent){
        let vdom = this.render()
        vdom.mountTo(parent)
    }
    appendChild(vchild){
        this.children.push(vchild)
    }
}
let insertChildren = (children, element) => {
    for(let child of children){
        if(Array.isArray(child)){
            insertChildren(child, element)
        } else {
            if(!(child instanceof Component) 
            && !(child instanceof TextWrapper)
            && !(child instanceof ElementWrapper)) {
                child = String(child)
            }
            if(typeof child === 'string'){
                child = new TextWrapper(child)
            }
            element.appendChild(child)
        }
    }
}

export let ToyReact = {
    // create custom component & html element(wrapped)
    createElement(type, attributes, ...children) {
        // debugger;// breakpoint
        let element;
        if(typeof type === 'string'){
            element = new ElementWrapper(type)
        } else {
            element = new type
        }
        // element = document.createElement(type);
        for(let name in attributes){
            element.setAttribute(name, attributes[name]);//attributes vs properties ??
        }

        // for(let child of children){
        //     if( typeof child === 'string') {
        //         child = new TextWrapper(child);                
        //     }
        //     element.appendChild(child);
        // }
        insertChildren(children, element);
        console.log(arguments)
        return element;
    },

    render(vdom, element){
        vdom.mountTo(element)
        // element.appendChild(vdom)

    }

}