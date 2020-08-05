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
        if(name === 'className'){
            name = 'class'
        }
        this.root.setAttribute(name, value)
    }
    appendChild(vchild){
        let range = document.createRange();
        if(this.root.children.length){
            range.setStartAfter(this.root.lastChild)
            range.setEndAfter(this.root.lastChild)
        } else {
            range.setStart(this.root, 0)
            range.setEnd(this.root, 0)
        }
        vchild.mountTo(range)
    }
    mountTo(range){
        range.deleteContents()
        range.insertNode(this.root)
        // parent.appendChild(this.root)
    }
}

//html strings. in react native, must be <Text>blabla</Text>
//only occurs as children, not type(createElement)
class TextWrapper {
    constructor(content){
        this.root = document.createTextNode(content)
    }
    mountTo(range){
        range.deleteContents()
        range.insertNode(this.root)
        // parent.appendChild(this.root)
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
    mountTo(range){
        //componentWillMount
        this.range = range;
        this.update()
        //componentDidMount
    }
    update(){
        let ph = document.createComment('placeholder')
        let range = document.createRange()
        range.setStart(this.range.endContainer, this.range.endOffset)
        range.setEnd(this.range.endContainer, this.range.endOffset)
        range.insertNode(ph)
        this.range.deleteContents()
        let vdom = this.render()
        vdom.mountTo(this.range)
        // ph.parentNode.removeChild(ph)

        //componentDidUpdate
    }
    appendChild(vchild){
        this.children.push(vchild)
    }
    //merge then re-render
    setState(state){
        let merge = (oldState, newState) => {
            for(let p in newState){
                if(typeof newState[p] === 'object' && newState[p] !== null){
                    if(typeof oldState[p] !== 'object'){
                        if(newState[p] instanceof Array){
                            oldState[p] = []
                        } else {
                            oldState[p] = {}
                        }
                    }
                    merge(oldState[p], newState[p]);
                } else {
                    oldState[p] = newState[p]
                }
            }
        }
        if(!this.state){
            this.state = {}
        }
        merge(this.state, state)
        // console.log(this.state, 'merged state')
        this.update()
    }
}
let insertChildren = (children, element) => {
    for(let child of children){
        if(Array.isArray(child)){
            insertChildren(child, element)
        } else {
            if(child === null || child === void 0){
                child = ''
            }
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
//TODO: check range api
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
        let range = document.createRange();
        if(element.children.length){
            range.setStartAfter(element.lastChild)
            range.setEndAfter(element.lastChild)
        } else {
            range.setStart(element, 0)
            range.setEnd(element, 0)
        }
        vdom.mountTo(range)
        this.range = range;
    }

}