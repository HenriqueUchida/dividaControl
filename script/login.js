import { supabaseClient } from './api/client.js';

const usuarioForm = document.getElementById('usuario');
const senhaForm = document.getElementById('senha');
const enviar = document.getElementById('enviar');

senhaForm.addEventListener('keydown', (event) => {
    if(event.key === 'Enter'){
        login(event);
    }
});

enviar.addEventListener('click', login);

async function login(event){
    event.preventDefault();
    const usuario = usuarioForm.value;
    const senha = senhaForm.value;

    const {data, error} = await supabaseClient.auth.signInWithPassword({
        email: usuario,
        password: senha
    });

    if(error){
        console.log('Falha ao realizar o login:', error.message);
    } else {
        console.log('Seja bem vindo!', data.user);
        window.location.href = './html/aplicacao.html'
    }
};