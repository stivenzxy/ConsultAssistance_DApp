const CONTRACT_ADDRESS = "0xB1376b51614BAb67EEF3006E4F7708a2405c2a87";

const ABI = [
    "function abrirAsistencia(uint256 _idSesion, string _temaClase, string _palabraSecreta)",
    "function marcarAsistencia(uint256 _idSesion, string _palabraSecreta)",
    "function cerrarAsistencia(uint256 _idSesion)",
    "function consultarSesion(uint256 _idSesion) view returns (uint256, string, bool, uint256)",
    "function verTotalAsistentes(uint256 _idSesion) view returns (address[])",
    "function consultarAsistencia(uint256 _idSesion, address estudiante) view returns (bool)",
    "event AsistenciaAbierta(uint256 idSesion, string temaClase, uint256 fecha)",
    "event AsistenciaMarcada(address estudiante, uint256 idSesion, uint256 fecha)",
    "event AsistenciaCerrada(uint256 idSesion, uint256 fecha)"
];
