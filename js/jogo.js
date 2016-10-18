/* Produzido por: Vinícius de Oliveira Silva
 * Contato: oliveira.vinicius.92@outlook.com
 * Versão: 1.5
*/

//Configuração da animação dos frames
window.requestAnimFrame = (function(callback){
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
		   window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
	function(callback){
		window.setTimeout(callback, 1000 / 60);
	};
})();

//Funções
var Nave = {
	Configuracao: function(){
		nave = {x: canvas.width/2,
				y: 500,
				frame: 1,
				velocidade: 3.5,
				largura: 38,
				inicioLargura: 14,
				fimLargura: 23,
				inicioAltura: -9,
				fimAltura: 25,
				imagem: "img/nave.png",
				imgNave: new Image()};
		explosao = {frames: 12,
					frameAtual: 0,
					largura: 38,
					velocidade: 3,
					velocidadeAtual: 0,
					imagem: "img/explosao.png",
					imgExplosao: new Image()};
		explosao.imgExplosao.src = explosao.imagem;
	},
	Criar: function(){
		var altura = nave.imgNave.height;
		nave.imgNave.src = nave.imagem;
		ctx.drawImage(nave.imgNave, nave.largura * nave.frame, 0,
					  nave.largura, altura, nave.x, nave.y,
					  nave.largura, altura);		
	},
	Movimento: function(){
		if (38 in keysDown && nave.y > 40){//Frente
            nave.y -= nave.velocidade;
        }if (40 in keysDown && nave.y < 500){//Trás
            nave.y += nave.velocidade;		
		}if (37 in keysDown && nave.x > 32){//Esquerda
            nave.x -= nave.velocidade;
			nave.frame = 0;
        }if (39 in keysDown && nave.x < canvas.width - 60){//Direita
            nave.x += nave.velocidade;
			nave.frame = 2;
        }		
		Nave.Criar();
	},
	Explosao: function(){
		ctx.clearRect(0, 0, canvas.width, canvas.height);//Apaga tudo
		Aerolito.Movimento(true);
		Aerolito.Margens();
		
		Jogo.HabilitarAudio();
		Jogo.ExibirPontos();
		ctx.drawImage(explosao.imgExplosao, explosao.largura * explosao.frameAtual,
					  0, explosao.largura, explosao.imgExplosao.height, nave.x - (explosao.largura / 2),
					  nave.y, explosao.largura * 2, explosao.imgExplosao.height * 2);		

		somExplosao.play();

		if(explosao.frameAtual > explosao.frames){
			Jogo.FimDeJogo();
		}else{
			explosao.velocidadeAtual++
			
			if(explosao.velocidadeAtual == explosao.velocidade){
				explosao.frameAtual++;
				explosao.velocidadeAtual = 0;
			}
			requestAnimFrame(function(){
				Nave.Explosao();
			});
		}
	}
}

var Aerolito = {
	Configuracao: function(){
		var contador = 0;
		for(var i = 0; i < 6; i++){
			var margem = 10;
			if(i > 2){
				margem = canvas.width - 20;				
			}
			
			if(contador == -800){
				contador = 0;
			}
			aerolitosMargens[i] = {x: parseInt(Math.random() * 5) + margem,
							  y: contador,
							  frame: parseInt(Math.random() * 4),
							  velocidade: 20,
							  largura: 15,
							  altura: 14,
							  imagem: "img/aerolito.png",
							  imgAerolito: new Image()};
			aerolitosMargens[i].imgAerolito.src = aerolitosMargens[i].imagem;
			contador -= 400;
		}
		
		for(var i = 0; i < 15; i++){
			aerolitos[i] = {x: parseInt(Math.random() * (canvas.width - 75)) + 30,
						y: parseInt(Math.random() * - 1000),
						frame: parseInt(Math.random() * 4),
						velocidade: parseInt(Math.random() * 5) + 5,
						largura: 15,
						altura: 14,
						imagem: "img/aerolito.png",
						imgAerolito: new Image()};
			aerolitos[i].imgAerolito.src = aerolitos[i].imagem;
		}
		velocidadeAerolitos = -4;
	},
	Criar: function(obj){
		ctx.drawImage(obj.imgAerolito, obj.largura * obj.frame, 0,
					  obj.largura, obj.altura, obj.x, obj.y,
					  obj.largura, obj.altura);
	},
	Movimento: function(animacao){
		var fim;
		for(var i = 0; i < aerolitos.length; i++){
			if(aerolitos[i].y >= canvas.height){ //Limite inferior
				aerolitos[i].y = 0;
				aerolitos[i].x = parseInt(Math.random() * (canvas.width - 75)) + 30;
				aerolitos[i].velocidade = parseInt(Math.random() * 5) + 5;
			}
			aerolitos[i].y += aerolitos[i].velocidade + velocidadeAerolitos;
			Aerolito.Criar(aerolitos[i]);
			Jogo.HabilitarAudio();
			if(!animacao){
				Jogo.ExibirPontos();
				Aerolito.AumentarVelocidade();
				if(Jogo.Colisao(i)){
					fim = true;
				}
			}
		}
		
		return fim;
	},
	AumentarVelocidade: function(){
		if(pontos >= margemPontos && pontos <= 1000){
			velocidadeAerolitos += 0.5;
			margemPontos += 50;
		}
	},
	Margens: function(){
		for(i = 0; i < aerolitosMargens.length; i++){
			var margem = 10;
			if(i > 2)
				margem = canvas.width - 20;			

			if(aerolitosMargens[i].y >= canvas.height){ //Limite inferior
				aerolitosMargens[i].y = 0;
				aerolitosMargens[i].x = parseInt(Math.random() * 5) + margem;				
			}
			aerolitosMargens[i].y += aerolitosMargens[0].velocidade;
			Aerolito.Criar(aerolitosMargens[i]);
		}		
	}
}

var Jogo = {
	Configuracao: function(){
		canvas.height = window.screen.height - 150;//Altura da tela
		ctx = canvas.getContext("2d"); //Contexto
		ctx.font = '20pt Calibri'; //Fonte texto
		ctx.fillStyle = 'white'; // Cor texto
		pontos = 0;
		margemPontos = 50;			
		audio = {largura: 48,
				 altura: 36,
				 x: canvas.width - 48,
				 y: canvas.height - 36,
				 imagem: "img/audio.png",
				 imgAudio: new Image(),
				 desativado: 21}
		audio.imgAudio.src = audio.imagem;		

		//Captura das teclas
		addEventListener('keydown', function (e){
			keysDown[e.keyCode] = true;
		}, false);
		addEventListener('keyup', function (e){
			delete keysDown[e.keyCode];
			nave.frame = 1;
		}, false);
		
		canvas.addEventListener("mousedown", Jogo.HabilitarAudio_click, false);

		Nave.Configuracao();
		Aerolito.Configuracao();
	},	
	TelaInicial: function(){
		ctx.clearRect(0, 0, canvas.width, canvas.height);//Apaga tudo
		var fim = Aerolito.Movimento(true);
		Aerolito.Margens();		
		
		ctx.save();
		ctx.textAlign = "center";
		ctx.fillText("AEROLITOS", canvas.width/2, canvas.height/2 - 100);
		ctx.fillText("Utilize as setas", canvas.width/2, canvas.height/2 + 80);
		ctx.fillText("Pressione ENTER", canvas.width/2, canvas.height/2 + 115);		
		ctx.restore();
		ctx.fillText("By: Vinícius Silva", 0, canvas.height - 35);
		

		if(13 in keysDown){ //Tecla enter
			Jogo.Configuracao();
			Jogo.Jogar();
		}else{
			requestAnimFrame(function(){
				Jogo.TelaInicial();
			});
		}
	},
	FimDeJogo: function(){
		ctx.clearRect(0, 0, canvas.width, canvas.height);//Apaga tudo
		Aerolito.Movimento(true);
		Aerolito.Margens();
		
		ctx.save();
		ctx.textAlign = "center";
		ctx.fillText("Fim de jogo", canvas.width/2, canvas.height/2);
		ctx.fillText("Pressione ENTER", canvas.width/2, canvas.height/2 + 35);
		ctx.restore();
		
		ctx.fillText("Record: " + parseInt(record), 0, canvas.height - 35);
		ctx.fillText("Pontos: " + parseInt(pontos), 0, canvas.height);

		if(13 in keysDown){ //Tecla enter
			somAstronautas.play();
			Jogo.Configuracao();
			Jogo.Jogar();
		}else{
			requestAnimFrame(function(){
				Jogo.FimDeJogo();
			});
			}
	},
	Jogar:function(){
		ctx.clearRect(0, 0, canvas.width, canvas.height);//Apaga tudo		
		Nave.Movimento();
		Aerolito.Margens();
		var fim = Aerolito.Movimento();

		if(!fim){
			requestAnimFrame(function(){
				Jogo.Jogar();
			});
		}else{
			somAstronautas.pause();
			somAstronautas.currentTime = 0;
			Nave.Explosao();
		}
	},		
	Colisao: function(i){
		if(parseInt(aerolitos[i].y) >= nave.y + nave.inicioAltura && parseInt(aerolitos[i].y) <= nave.y + nave.fimAltura){
			if((parseInt(aerolitos[i].x) > nave.x + nave.inicioLargura && parseInt(aerolitos[i].x) < nave.x + nave.fimLargura) ||
				(parseInt(aerolitos[i].x) + aerolitos[i].largura/2 > nave.x + nave.inicioLargura && parseInt(aerolitos[i].x) + aerolitos[i].largura/2 < nave.x + nave.fimLargura) ||
				(parseInt(aerolitos[i].x) + aerolitos[i].largura > nave.x + nave.inicioLargura && parseInt(aerolitos[i].x) + aerolitos[i].largura < nave.x + nave.fimLargura)){
				return true;
			}
		}
		return false;
	},
	ExibirPontos: function(animacao){
		pontos += (canvas.height - nave.y) / 100000; //Cálculo dos pontos
		if(nave.y <= 40){
			pontos += 1/300;
		}

		if(pontos > record){
			record = pontos;
		}
		ctx.fillText("Record: " + parseInt(record), 0, canvas.height - 35);
		ctx.fillText("Pontos: " + parseInt(pontos), 0, canvas.height);
	},
	HabilitarAudio: function(){
		ctx.drawImage(audio.imgAudio, 0, 0,
					  audio.largura - audioDesativado, audio.altura,
					  audio.x, audio.y, audio.largura - audioDesativado, audio.altura);
	},
	HabilitarAudio_click: function(event){
		if(event.pageX >= audio.x && event.pageY >= audio.y){
			if(audioDesativado == 0){
				audioDesativado = audio.desativado;
				somAstronautas.volume = 0;
				somExplosao.volume = 0;
			}else{
				audioDesativado = 0;
				somAstronautas.volume = 0.4;
				somExplosao.volume = 0.2;
			}
		}
	}
}

//Inicialização das variáveis
var canvas = document.getElementById("canvas"),
	ctx, pontos, keysDown = {}, record = 0;
var nave, explosao, audio, audioDesativado = 0;
var aerolitos = new Array(), aerolitosMargens = new Array(), velocidadeAerolitos, margemPontos;
var somAstronautas = document.getElementById("astronautas"),
	somExplosao = document.getElementById("explosao");
somAstronautas.volume = 0.4;
somExplosao.volume = 0.2;

Jogo.Configuracao();
somAstronautas.play();
Jogo.TelaInicial();