const inicioEvento = new Date('2023-03-21T08:00:00')
const terminoEvento = new Date('2023-03-21T18:00:00')

const minutos = dayjs(terminoEvento).diff(dayjs(inicioEvento), 'minute')
const horarios = '0'.repeat(minutos)
const horariosInicializados = horarios.split('').map((h, i) => {
	return dayjs(inicioEvento).add(i, 'minute').format('HH:mm')
})


const salas = [
	{ nome: 'sala1', duracao: 8, horarios: horarios },
	{ nome: 'sala2', duracao: 6, horarios: horarios },
	{ nome: 'sala3', duracao: 5, horarios: horarios },
	{ nome: 'sala4', duracao: 9, horarios: horarios },
	{ nome: 'sala5', duracao: 10, horarios: horarios },
	{ nome: 'sala6', duracao: 3, horarios: horarios },
	{ nome: 'sala7', duracao: 8, horarios: horarios },
	{ nome: 'sala8', duracao: 12, horarios: horarios },
]

// let grupos = [
// 	{ id: 'a', nome: 'Escola Maria Rezende', monitor: 'Raik Suel', chegada: new Date('2021-01-01T08:00:00'), offset: 0, background: 'bg-red-400' },
// 	{ id: 'b', nome: 'Escola Souza Lopes', monitor: 'Diego Maciel', chegada: new Date('2021-01-01T08:00:00'), offset: 0, background: 'bg-orange-400' },
// 	{ id: 'c', nome: 'Escola Normal', monitor: 'Sandra Novais', chegada: new Date('2021-01-01T08:00:00'), offset: 0, background: 'bg-amber-400' },
// 	{ id: 'd', nome: 'Escola Clarita', monitor: 'Gisenilda', chegada: new Date('2021-01-01T08:10:00'), offset: 0, background: 'bg-yellow-400' },
// 	{ id: 'e', nome: 'IFNMG', monitor: 'Baianim', chegada: new Date('2021-01-01T08:16:00'), offset: 0, background: 'bg-lime-400' },
// 	{ id: 'f', nome: 'Escola Municipal Lourdes', monitor: 'Licia', chegada: new Date('2021-01-01T08:13:00'), offset: 0, background: 'bg-emerald-400' },
// 	{ id: 'g', nome: 'Escola José Almeida', monitor: 'Tiago Enrique', chegada: new Date('2021-01-01T09:00:00'), offset: 0, background: 'bg-teal-400' },
// 	{ id: 'h', nome: 'Escola Clemente Viana', monitor: 'Tiago Lages', chegada: new Date('2021-01-01T09:30:00'), offset: 0, background: 'bg-cyan-400' },
// 	{ id: 'i', nome: 'Escola São Lucas', monitor: 'Letsilane', chegada: new Date('2021-01-01T08:00:00'), offset: 0, background: 'bg-sky-400' },
// 	{ id: 'j', nome: 'Escola Patricia Villela', monitor: 'Guilherme', chegada: new Date('2021-01-01T09:30:00'), offset: 0, background: 'bg-blue-400' },
// 	{ id: 'k', nome: 'Escola Hugo Novais', monitor: 'Eugênio', chegada: new Date('2021-01-01T08:00:00'), offset: 0, background: 'bg-indigo-400' },
// 	{ id: 'l', nome: 'Escola Pedro Antônio', monitor: 'Gabriella', chegada: new Date('2021-01-01T08:00:00'), offset: 0, background: 'bg-rose-400' },
// ]

function boot() {
	definirGrupoLocalstorage()
	inicializarOffsetGrupos()

	calcularVisitas()
}
boot()

function inicializarOffsetGrupos() {
	const grupoInicializado = []
	for (const grupo of getGrupos()) {
		grupoInicializado.push({
			...grupo,
			offset: dayjs(grupo.chegada).diff(dayjs(inicioEvento), 'minute')
		})
	}
	localStorage.setItem('grupos', JSON.stringify(grupoInicializado))
}

function definirGrupoLocalstorage() {
	if (!localStorage.getItem('grupos')) {
		localStorage.setItem('grupos', JSON.stringify([]))
	}
}

function getGrupos() {
	return JSON.parse(localStorage.getItem('grupos'))
}

function getGrupo(id) {
	const grupos = getGrupos()
	return grupos.find(grupo => grupo.id === id)
}

function setGrupo(grupo) {
	const grupos = getGrupos()
	grupos.push(grupo)
	localStorage.setItem('grupos', JSON.stringify(grupos))
}

function updateGrupo(grupo) {
	const grupos = getGrupos()
	const grupoIndex = grupos.findIndex(g => g.id === grupo.id)
	grupos[grupoIndex] = grupo
	localStorage.setItem('grupos', JSON.stringify(grupos))
}

function getProximoIdentificadorGrupo() {
	const grupos = getGrupos()
	if (grupos.length === 0) {
		return 'a'
	}
	const ultimoGrupo = grupos[grupos.length - 1]
	const chars = 'abcdefghijklmnopqrstuvwxyz'
	const proximoIdentificador = chars[chars.indexOf(ultimoGrupo.id) + 1]
	return proximoIdentificador
}

function obterHorarioMaisProximo(sala, offset) {
	const disponivel = '0'.repeat(sala.duracao)
	const horarios = sala.horarios.indexOf(disponivel, offset)
	return horarios
}

function agendarHorario(grupo, sala, index) {
	for (const i of Array(sala.duracao).keys()) {
		sala.horarios = sala.horarios.substring(0, index + i) + grupo.id + sala.horarios.substring(index + i + 1)
	}

	for (const g of getGrupos()) {
		if (g.id === grupo.id) {
			const grupo = getGrupo(g.id)
			grupo.offset = index + sala.duracao
			updateGrupo(grupo)
		}
	}
}

function calcularOrdemVisitas(grupo) {
	let localOffset = grupo.offset
	let salasCompletamenteOrdenadas = []

	const ordenacaoParcial = () => {
		const pesos = []

		const salasDisponiveis = salas.filter(sala => {
			const todasAsSalasOrdenadas = salasCompletamenteOrdenadas.map(s => s.nome)
			return !todasAsSalasOrdenadas.includes(sala.nome)
		})

		for (const sala of salasDisponiveis) {
			const disponivel = '0'.repeat(sala.duracao)
			const offsetAbsoluto = sala.horarios.indexOf(disponivel, localOffset)
			const offsetRelativo = offsetAbsoluto - localOffset
			const pesoCalculado = ((offsetRelativo + 1) * -1000) + sala.duracao
			pesos.push({ peso: pesoCalculado, sala })
		}

		const menorPeso = pesos.sort((a, b) => a.peso - b.peso).pop()
		salasCompletamenteOrdenadas.push(menorPeso.sala)
		localOffset = localOffset + menorPeso.sala.duracao
	}

	while (salasCompletamenteOrdenadas.length < salas.length) {
		ordenacaoParcial()
	}

	return salasCompletamenteOrdenadas
}

function calcularVisitas() {
	const grupos = getGrupos()
	for (const grupo of grupos) {
		const grupoReload = getGrupo(grupo.id)
		const salasOrdenadas = calcularOrdemVisitas(grupoReload)
		for (const sala of salasOrdenadas) {
			const grupoReload = getGrupo(grupo.id)
			const proximoHorario = obterHorarioMaisProximo(sala, grupoReload.offset)
			agendarHorario(grupoReload, sala, proximoHorario)
		}
	}
}

function visitas() {
	return salas
}

function findBackgroundGrupo(id) {
	const chars = 'abcdefghijklmnopqrstuvwxyz';
	const colors = [
		"#FF5733", "#33FF57", "#3357FF",
		"#FF33FF", "#FFFF33", "#33FFFF",
		"#F0F8FF", "#FAEBD7", "#00FFFF",
		"#7FFFD4", "#F0FFFF", "#F5F5DC",
		"#FFE4C4", "#000000", "#0000FF",
		"#8A2BE2", "#A52A2A", "#DEB887",
		"#5F9EA0", "#7FFF00", "#D2691E",
		"#FF7F50", "#6495ED", "#FFF8DC"
	];


	if (id === '0') {
		return 'bg-white'
	}

	return colors[chars.indexOf(id)]
}

function getHorarios(grupo, sala) {
	const horarios = sala.horarios.split('')
	const indices = []
	for (const [index, h] of horarios.entries()) {
		if (h === grupo.id) {
			indices.push(index)
		}
	}

	const horariosReais = indices.map(i => {
		return horariosInicializados[i]
	})

	return {
		inicio: horariosReais[0],
		termino: horariosReais[horariosReais.length - 1].split(':')[0] + ':' + (Number(horariosReais[horariosReais.length - 1].split(':')[1]) + 1)
		// termino: horariosReais[horariosReais.length - 1]
	}
}

function horaParaMinutos(hora) {
	const [horas, minutos] = hora.split(':').map(Number);
	return horas * 60 + minutos;
}

function getRelatorio() {
	const relatorio = []

	for (const grupo of getGrupos()) {
		const visitas = []
		for (const sala of salas) {
			const horarios = getHorarios(grupo, sala)
			visitas.push({ sala: sala.nome, ...horarios })
		}
		relatorio.push({
			dados: grupo, visitas: visitas.sort((a, b) => {
				return horaParaMinutos(a.inicio) - horaParaMinutos(b.inicio)
			})
		})
	}

	return { grupos: relatorio };
}

function excluirGrupo(id) {
	const grupos = getGrupos()
	const gruposFiltrados = grupos.filter(grupo => grupo.id !== id)
	localStorage.setItem('grupos', JSON.stringify(gruposFiltrados))

	location.reload()
}

function formularioCadastro() {
	return {
		identificador: getProximoIdentificadorGrupo(),
		nome: '',
		monitor: '',
		chegada: '',
		inserirGrupo() {
			const dataChegada = new Date(new Date(inicioEvento).setHours(this.chegada.split(':')[0], this.chegada.split(':')[1]))
			setGrupo({
				id: this.identificador,
				nome: this.nome,
				monitor: this.monitor,
				chegada: dataChegada,
				offset: 0,
			})

			location.reload()
		}
	}
}


function listagem() {
	return { gruposs: getGrupos() }
}

function resumo() {
	return {
		inicio: inicioEvento,
		termino: terminoEvento,
	}
}







// for (const grupo of grupos) {
// 	const salasOrdenadas = calcularOrdemVisitas(grupo)
// 	for (const sala of salasOrdenadas) {
// 		const proximoHorario = obterHorarioMaisProximo(sala, grupo.offset)
// 		agendarHorario(grupo, sala, proximoHorario)
// 	}
// }
// const salasSorted = salas.sort((a, b) => b.nome - a.nome)
// for (const sala of salasSorted) {
// 	console.log(sala.nome, sala.horarios)
// }
// console.log(grupos)
