//html elements, div, span, etc
class ElementWrapper {
    constructor(type){
        this.root = document.createElement(type)
    }
    setAttribute(name, value){
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

        for(let child of children){
            if( typeof child === 'string') {
                child = new TextWrapper(child);                
            }
            element.appendChild(child);
        }
        console.log(arguments)
        return element;
    },

    render(vdom, element){
        vdom.mountTo(element)
        // element.appendChild(vdom)

    }

}