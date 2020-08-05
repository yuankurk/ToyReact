//html elements, div, span, etc
let childrenSymbol = Symbol("children")
class ElementWrapper {
    constructor(type){
        this.type = type;
        this.props = Object.create(null);
        this[childrenSymbol] = [];
        this.children = []
    }
    setAttribute(name, value){
        // //event-handling
        // if(name.match(/^on([\s\S]+)$/)){
        //     let eventName = RegExp.$1.replace(/^[\s\S]/, s=>s.toLowerCase())
        //     // console.log(eventName)
        //     this.root.addEventListener(eventName, value)
        // }
        // if(name === 'className'){
        //     name = 'class'
        // }
        // this.root.setAttribute(name, value)
        this.props[name] = value
    }
    appendChild(vchild){
        this[childrenSymbol].push(vchild)
        this.children.push(vchild.vdom)
        // let range = document.createRange();
        // if(this.root.children.length){
        //     range.setStartAfter(this.root.lastChild)
        //     range.setEndAfter(this.root.lastChild)
        // } else {
        //     range.setStart(this.root, 0)
        //     range.setEnd(this.root, 0)
        // }
        // vchild.mountTo(range)
    }
    get vdom() {
        return this
    }
    mountTo(range){
        this.range = range;

        let ph = document.createComment('placeholder')
        let endRange = document.createRange()
        endRange.setStart(range.endContainer, range.endOffset)
        endRange.setEnd(range.endContainer, range.endOffset)
        endRange.insertNode(ph)

        range.deleteContents()
        let element = document.createElement(this.type)
        for(let name in this.props){
            let value = this.props[name]
            //event-handling
            if(name.match(/^on([\s\S]+)$/)){
                let eventName = RegExp.$1.replace(/^[\s\S]/, s=>s.toLowerCase())
                // console.log(eventName)
                element.addEventListener(eventName, value)
            }
            if(name === 'className'){
                name = 'class'
            }
            element.setAttribute(name, value)
        }

        //render
        for(let child of this.children){
            let range = document.createRange();
            if(element.children.length){
                range.setStartAfter(element.lastChild)
                range.setEndAfter(element.lastChild)
            } else {
                range.setStart(element, 0)
                range.setEnd(element, 0)
            }
            // console.log(child)
            child.mountTo(range)
        }
        range.insertNode(element)
    }
}

//html strings. in react native, must be <Text>blabla</Text>
//only occurs as children, not type(createElement)
class TextWrapper {
    constructor(content){
        this.root = document.createTextNode(content)
        this.type ='#text'
        this.children = []
        this.props = Object.create(null);
    }
    mountTo(range){
        this.range = range;
        range.deleteContents()
        range.insertNode(this.root)
        // parent.appendChild(this.root)
    }
    get vdom() {
        return this
    }
}
export class Component {
    constructor(){
        this.children = []
        this.props = Object.create(null) //clean
    }
    get type(){
        return this.constructor.name
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
        let vdom = this.vdom
        if(this.oldVdom){
            //check type, props, children(?), key(?)
            let isSameNode = (node1, node2)=>{
                if(node1.type !== node2.type){
                    return false;
                }
                for(let name in node1.props){
                    // if(typeof node1.props[name] === 'function' && typeof node2.props[name] === 'function'
                    // && node1.props[name].toString() === node2.props[name].toString){
                    //     continue;
                    // }
                    if(typeof node1.props[name] === 'object' && typeof node2.props[name] === 'object'
                    && JSON.stringify(node1.props[name]) === JSON.stringify(node2.props[name])){
                        continue;
                    }
                    if(node1.props[name] !== node2.props[name]){
                        return false;
                    }
                }
                if(Object.keys(node1.props).length !== Object.keys(node2.props).length){
                    return false;
                }
                return true;
            }
            let isSameTree = (node1, node2) => {
                if(!isSameNode(node1, node2)){
                    return false;
                }
                if(node1.children.length !== node2.children.length){
                    return false;
                }
                for(let i = 0; i < node1.children.length; i++){
                    if(!isSameTree(node1.children[i], node2.children[i])){
                        return false;
                    }
                }
                return true;                
            }

            let replace = (newTree, oldTree) => {
                if(isSameTree(newTree, oldTree)){
                    return;
                }
                if(!isSameNode(newTree, oldTree)){
                    newTree.mountTo(oldTree.range)
                } else {
                    //children
                    // console.log(newTree.children.length, 'replace')
                    for(let i = 0; i < newTree.children.length; i++){
                        replace(newTree.children[i], oldTree.children[i])
                    }
                }

            }
            replace(vdom, this.oldVdom)
        } else {
            vdom.mountTo(this.range)
        }
        this.oldVdom = vdom
        //componentDidUpdate
    }

    get vdom() {
        return this.render().vdom
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
        // console.log(arguments)
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