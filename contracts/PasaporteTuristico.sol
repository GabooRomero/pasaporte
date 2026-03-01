// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract PasaporteTuristico is ERC1155, Ownable {
    // La URL base donde vivirá nuestra API dinámica
    string public baseURI;
    
    // Asignación de nombres (opcional para mercados como OpenSea)
    string public name = "Pasaporte Turistico Oficial";
    string public symbol = "PASAPORTE";

    constructor(address initialOwner, string memory _baseURI) ERC1155(_baseURI) Ownable(initialOwner) {
        baseURI = _baseURI;
    }

    // Cambiar la URI si alguna vez cambiamos de dominio
    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
        baseURI = newuri;
    }

    // Función principal para que nuestro backend regale las insignias
    // "tourist" = la wallet invisible de Privy del usuario
    // "attractionId" = Ej: 0 (Glaciar), 1 (Cataratas) -> Lo mapearemos con un entero en el backend
    function mintInsignia(address tourist, uint256 attractionId) public onlyOwner {
        _mint(tourist, attractionId, 1, "");
    }

    // Sobrescribe el URI estándar para asegurarse de que devuelva nuestra URL exacta
    // Ej: https://tudominio.com/api/metadata/0
    function uri(uint256 _id) public view override returns (string memory) {
        return string(abi.encodePacked(baseURI, Strings.toString(_id)));
    }
}
