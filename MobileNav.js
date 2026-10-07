(function(){
  function iniciarMenuMobile(){
    const botao=document.querySelector('.menuMobileToggle');
    const menu=document.querySelector('.menu, .menuAdmin');
    if(!botao||!menu)return;
    const fechar=()=>{menu.classList.remove('menuMobileAberto');botao.classList.remove('aberto');botao.setAttribute('aria-expanded','false');botao.textContent='☰';};
    botao.addEventListener('click',()=>{
      const aberto=menu.classList.toggle('menuMobileAberto');
      botao.classList.toggle('aberto',aberto);
      botao.setAttribute('aria-expanded',String(aberto));
      botao.textContent=aberto?'×':'☰';
    });
    menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',fechar));
    window.addEventListener('resize',()=>{if(window.innerWidth>700)fechar();});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciarMenuMobile);else iniciarMenuMobile();
})();
