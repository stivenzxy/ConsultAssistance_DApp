const CONTRACT_ADDRESS = "0xB1376b51614BAb67EEF3006E4F7708a2405c2a87";

const ABI = [
    "function abrirAsistencia(uint256 _idSesion, string _temaClase, string _palabraSecreta)",
    "function marcarAsistencia(string _palabraSecreta)",
    "function cerrarAsistencia()",
    "function consultarSesion() view returns (uint256, string, bool, uint256)",
    "function verTotalAsistentes() view returns (address[])",
    "function consultarAsistencia(address estudiante) view returns (bool)",
    "event AsistenciaAbierta(uint256 idSesion, string temaClase, uint256 fecha)",
    "event AsistenciaMarcada(address estudiante, uint256 idSesion, uint256 fecha)",
    "event AsistenciaCerrada(uint256 idSesion, uint256 fecha)"
];
