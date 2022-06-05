const button = document.querySelector('button')!;


const clickHandler = (message :string) => {
    console.log('Clicked! ' + message)
}
if(button){
    button.addEventListener('click', clickHandler.bind(null,"You're welcome"));
}