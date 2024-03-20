const inicioEvento = new Date('2021-01-01T08:00:00')
const terminoEvento = new Date('2021-01-01T12:00:00')

const minutos = dayjs(terminoEvento).diff(dayjs(inicioEvento), 'minute')
const horarios = '0'.repeat(minutos)

const salas = [
	{ nome: 'sala1', duracao: 3, horarios: horarios },
	{ nome: 'sala2', duracao: 7, horarios: horarios },
	{ nome: 'sala3', duracao: 5, horarios: horarios },
	{ nome: 'sala4', duracao: 9, horarios: horarios },
	{ nome: 'sala5', duracao: 10, horarios: horarios },
	{ nome: 'sala6', duracao: 3, horarios: horarios },
	{ nome: 'sala7', duracao: 8, horarios: horarios },
	{ nome: 'sala8', duracao: 12, horarios: horarios },
]

let grupos = [
	{ nome: 'a', chegada: new Date('2021-01-01T08:00:00'), offset: 0, background: 'bg-red-400' },
	{ nome: 'b', chegada: new Date('2021-01-01T08:00:00'), offset: 0, background: 'bg-orange-400' },
	{ nome: 'c', chegada: new Date('2021-01-01T08:00:00'), offset: 0, background: 'bg-amber-400' },
	{ nome: 'd', chegada: new Date('2021-01-01T08:10:00'), offset: 0, background: 'bg-yellow-400' },
	{ nome: 'e', chegada: new Date('2021-01-01T08:16:00'), offset: 0, background: 'bg-lime-400' },
	{ nome: 'f', chegada: new Date('2021-01-01T08:13:00'), offset: 0, background: 'bg-emerald-400' },
	{ nome: 'g', chegada: new Date('2021-01-01T09:00:00'), offset: 0, background: 'bg-teal-400' },
	{ nome: 'h', chegada: new Date('2021-01-01T09:30:00'), offset: 0, background: 'bg-cyan-400' },
	{ nome: 'i', chegada: new Date('2021-01-01T08:00:00'), offset: 0, background: 'bg-sky-400' },
	{ nome: 'j', chegada: new Date('2021-01-01T08:00:00'), offset: 0, background: 'bg-blue-400' },
	{ nome: 'k', chegada: new Date('2021-01-01T08:00:00'), offset: 0, background: 'bg-indigo-400' },
	{ nome: 'l', chegada: new Date('2021-01-01T08:00:00'), offset: 0, background: 'bg-rose-400' },
]

function inicializarOffsetGrupos() {
	const grupoInicializado = []
	for (const grupo of grupos) {
		// logica aqui
		grupoInicializado.push({
			...grupo,
			offset: grupo.offset + dayjs(grupo.chegada).diff(dayjs(inicioEvento), 'minute')
		})
	}
	grupos = grupoInicializado
}
inicializarOffsetGrupos()

function obterHorarioMaisProximo(sala, offset) {
	const disponivel = '0'.repeat(sala.duracao)
	const horarios = sala.horarios.indexOf(disponivel, offset)
	return horarios
}

function agendarHorario(grupo, sala, index) {
	for (const i of Array(sala.duracao).keys()) {
		sala.horarios = sala.horarios.substring(0, index + i) + grupo.nome + sala.horarios.substring(index + i + 1)
	}

	for (const g of grupos) {
		if (g.nome === grupo.nome) {
			g.offset = index + sala.duracao
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


	// const order = []
	// for (const sala of salas) {
	// 	const disponivel = '0'.repeat(sala.duracao)
	// 	const offset = sala.horarios.indexOf(disponivel, grupo.offset)
	// 	order.push({ order: (offset + 1) * -1000, sala })
	// }
	// const final = []
	// order.sort((a, b) => (b.order + b.sala.duracao) - (a.order + a.sala.duracao)).forEach(o => final.push(o.sala))
	// return final
}

function visitas() {
	for (const grupo of grupos) {
		const salasOrdenadas = calcularOrdemVisitas(grupo)
		for (const sala of salasOrdenadas) {
			const proximoHorario = obterHorarioMaisProximo(sala, grupo.offset)
			agendarHorario(grupo, sala, proximoHorario)
		}
	}
	return salas
}

function findBackgroundGrupo(nome) {
	if (nome === 0) {
		return 'bg-white'
	}
	return grupos.find(grupo => grupo.nome === nome).background
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