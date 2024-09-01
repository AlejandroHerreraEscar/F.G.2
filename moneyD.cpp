#include <iostream>
#include <vector>
#include <string>

struct Ingreso
{
    int dia;
    int mes;
    int anio;
    float monto;
    std::string descripcion;
};

struct Gasto
{
    int dia;
    int mes;
    int anio;
    float monto;
    std::string descripcion;
};

std::vector<Ingreso> ingresos;
std::vector<Gasto> gastos;

void registrarIngreso()
{
    Ingreso ingreso;
    std::cout << "Ingrese la fecha (dd/mm/aaaa): ";
    std::cin >> ingreso.dia >> ingreso.mes >> ingreso.anio;
    std::cout << "Ingrese el monto: ";
    std::cin >> ingreso.monto;
    std::cout << "Ingrese la descripcion: ";
    std::cin.ignore();
    std::getline(std::cin, ingreso.descripcion);
    ingresos.push_back(ingreso);
}

void registrarGasto()
{
    Gasto gasto;
    std::cout << "Ingrese la fecha (dd/mm/aaaa): ";
    std::cin >> gasto.dia >> gasto.mes >> gasto.anio;
    std::cout << "Ingrese el monto: ";
    std::cin >> gasto.monto;
    std::cout << "Ingrese la descripcion: ";
    std::cin.ignore();
    std::getline(std::cin, gasto.descripcion);
    gastos.push_back(gasto);
}

void mostrarBalance()
{
    float balance = 0;
    for (size_t i = 0; i < ingresos.size(); ++i)
    {
        balance += ingresos[i].monto;
    }
    for (size_t i = 0; i < gastos.size(); ++i)
    {
        balance -= gastos[i].monto;
    }
    std::cout << "Balance total: " << balance << std::endl;
}

void mostrarHistorial()
{
    std::cout << "Ingresos: " << std::endl;
    for (size_t i = 0; i < ingresos.size(); ++i)
    {
        std::cout << ingresos[i].dia << "/" << ingresos[i].mes << "/" << ingresos[i].anio << " - " << ingresos[i].monto << " - " << ingresos[i].descripcion << std::endl;
    }
    std::cout << "Gastos: " << std::endl;
    for (size_t i = 0; i < gastos.size(); ++i)
    {
        std::cout << gastos[i].dia << "/" << gastos[i].mes << "/" << gastos[i].anio << " - " << gastos[i].monto << " - " << gastos[i].descripcion << std::endl;
    }
}

int main()
{
    int opcion;
    do
    {
        std::cout << "1. Registrar ingreso" << std::endl;
        std::cout << "2. Registrar gasto" << std::endl;
        std::cout << "3. Mostrar balance" << std::endl;
        std::cout << "4. Mostrar historial" << std::endl;
        std::cout << "5. Salir" << std::endl;
        std::cin >> opcion;
        switch (opcion)
        {
        case 1:
            registrarIngreso();
            break;
        case 2:
            registrarGasto();
            break;
        case 3:
            mostrarBalance();
            break;
        case 4:
            mostrarHistorial();
            break;
        case 5:
            break;
        default:
            std::cout << "Opcion invalida" << std::endl;
        }
    } while (opcion != 5);
    return 0;
}


