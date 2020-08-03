import {ToyReact} from './ToyReact.js'
class MyComponent {
    render() {
        return <div>
            <span>hello,</span>
            <span>world!</span>
            </div>
    }
    setAttribute(name, value) {
        this[name] = value
    }
    mountTo(parent){
        let vdom = this.render()
        // console.log(vdom, 'vdom of MyComponent')
        vdom.mountTo(parent)
    }
}
let a = <MyComponent name="a"/>;
// let a = <div name="a"/>
// console.log(a)

ToyReact.render(a, document.body)

// let b =<div name="b">
//     <span>hello</span>
//     <span>world</span>
//     <span>!</span>
// </div>
// // console.log(b)
// document.body.appendChild(b)

