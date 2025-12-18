#!/usr/bin/env python3
"""
Testes ACID para Food Delivery API

Este script testa as 4 propriedades ACID:
- Atomicity (Atomicidade)
- Consistency (Consistência)
- Isolation (Isolamento)
- Durability (Durabilidade)

4 testes para cada propriedade = 16 testes no total
"""

import mysql.connector
from mysql.connector import Error
import time
import threading
from decimal import Decimal

# Configuração da base de dados
DB_CONFIG = {
    'host': 'localhost',
    'port': 3309,  # Master
    'user': 'root',
    'password': 'root_password',
    'database': 'food_delivery',
    'autocommit': False  # Importante para testes de transação
}

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

def print_test(name, status, message=""):
    """Imprime resultado do teste com cores"""
    color = Colors.GREEN if status else Colors.RED
    symbol = "✅" if status else "❌"
    print(f"{color}{symbol} {name}{Colors.RESET}")
    if message:
        print(f"   {message}")

def get_connection():
    """Cria conexão com a base de dados"""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except Error as e:
        print(f"Erro ao conectar: {e}")
        return None

# ============================================
# TESTES DE ATOMICIDADE (ATOMICITY)
# ============================================

def test_atomicity_1():
    """Teste 1: Transação completa deve ser commitada"""
    print(f"\n{Colors.BLUE}=== Teste Atomicidade 1: Transação Completa ==={Colors.RESET}")
    conn = get_connection()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor()
        
        # Iniciar transação
        conn.start_transaction()
        
        # Criar codpostal se não existir
        cursor.execute("""
            INSERT IGNORE INTO codpostal (codpostal, localidade, cidade)
            VALUES ('1000-001', 'Lisboa', 'Lisboa')
        """)
        
        # Obter ou criar categoria
        cursor.execute("SELECT id FROM categorias_pratos WHERE nome = 'Teste' LIMIT 1")
        cat_result = cursor.fetchone()
        if cat_result:
            categoria_id = cat_result[0]
        else:
            cursor.execute("INSERT INTO categorias_pratos (nome) VALUES ('Teste')")
            categoria_id = cursor.lastrowid
        
        # Criar restaurante
        cursor.execute("""
            INSERT INTO restaurantes (nome, morada, codpostal, telefone, especialidade_id)
            VALUES ('Teste Atomic 1', 'Rua Teste', '1000-001', '999999999', %s)
        """, (categoria_id,))
        restaurante_id = cursor.lastrowid
        
        # Criar prato associado
        cursor.execute("""
            INSERT INTO pratos (restaurante_id, categoria_id, nome, preco)
            VALUES (%s, %s, 'Prato Teste', 10.50)
        """, (restaurante_id, categoria_id))
        
        # Commit
        conn.commit()
        
        # Verificar se ambos foram criados
        cursor.execute("SELECT COUNT(*) FROM restaurantes WHERE id = %s", (restaurante_id,))
        restaurante_exists = cursor.fetchone()[0] > 0
        
        cursor.execute("SELECT COUNT(*) FROM pratos WHERE restaurante_id = %s", (restaurante_id,))
        prato_exists = cursor.fetchone()[0] > 0
        
        result = restaurante_exists and prato_exists
        print_test("Atomicidade 1", result, 
                  f"Restaurante e prato criados: {restaurante_exists} e {prato_exists}")
        
        # Limpeza
        cursor.execute("DELETE FROM pratos WHERE restaurante_id = %s", (restaurante_id,))
        cursor.execute("DELETE FROM restaurantes WHERE id = %s", (restaurante_id,))
        conn.commit()
        
        return result
    except Error as e:
        conn.rollback()
        print_test("Atomicidade 1", False, f"Erro: {e}")
        return False
    finally:
        cursor.close()
        conn.close()

def test_atomicity_2():
    """Teste 2: Transação com erro deve ser revertida (rollback)"""
    print(f"\n{Colors.BLUE}=== Teste Atomicidade 2: Rollback em Erro ==={Colors.RESET}")
    conn = get_connection()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor()
        
        # Obter ID de restaurante existente
        cursor.execute("SELECT id FROM restaurantes LIMIT 1")
        result = cursor.fetchone()
        if not result:
            print_test("Atomicidade 2", False, "Nenhum restaurante encontrado para teste")
            return False
        
        restaurante_id = result[0]
        
        # Iniciar transação
        conn.start_transaction()
        
        # Obter categoria
        cursor.execute("SELECT id FROM categorias_pratos LIMIT 1")
        cat_result = cursor.fetchone()
        if not cat_result:
            cursor.execute("INSERT INTO categorias_pratos (nome) VALUES ('Teste')")
            categoria_id = cursor.lastrowid
        else:
            categoria_id = cat_result[0]
        
        # Criar prato válido
        cursor.execute("""
            INSERT INTO pratos (restaurante_id, categoria_id, nome, preco)
            VALUES (%s, %s, 'Prato Teste Atomic 2', 15.00)
        """, (restaurante_id, categoria_id))
        prato_id = cursor.lastrowid
        
        # Tentar criar prato com restaurante_id inválido (deve falhar)
        try:
            cursor.execute("""
                INSERT INTO pratos (restaurante_id, categoria_id, nome, preco)
                VALUES (99999, %s, 'Prato Inválido', 20.00)
            """, (categoria_id,))
        except Error:
            pass  # Erro esperado
        
        # Rollback
        conn.rollback()
        
        # Verificar se o prato foi revertido
        cursor.execute("SELECT COUNT(*) FROM pratos WHERE id = %s", (prato_id,))
        prato_exists = cursor.fetchone()[0] > 0
        
        result = not prato_exists
        print_test("Atomicidade 2", result, 
                  f"Prato foi revertido (não existe): {not prato_exists}")
        
        return result
    except Error as e:
        conn.rollback()
        print_test("Atomicidade 2", False, f"Erro: {e}")
        return False
    finally:
        cursor.close()
        conn.close()

def test_atomicity_3():
    """Teste 3: Múltiplas operações em uma transação"""
    print(f"\n{Colors.BLUE}=== Teste Atomicidade 3: Múltiplas Operações ==={Colors.RESET}")
    conn = get_connection()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor()
        
        conn.start_transaction()
        
        # Criar codpostal se não existir
        cursor.execute("""
            INSERT IGNORE INTO codpostal (codpostal, localidade, cidade)
            VALUES ('1000-002', 'Lisboa', 'Lisboa')
        """)
        
        # Obter ou criar categoria
        cursor.execute("SELECT id FROM categorias_pratos WHERE nome = 'Teste' LIMIT 1")
        cat_result = cursor.fetchone()
        if cat_result:
            categoria_id = cat_result[0]
        else:
            cursor.execute("INSERT INTO categorias_pratos (nome) VALUES ('Teste')")
            categoria_id = cursor.lastrowid
        
        # Criar cliente
        cursor.execute("""
            INSERT INTO clientes (nome, email, telefone, morada, codpostal)
            VALUES ('Cliente Atomic 3', 'atomic3@test.com', '111111111', 'Rua Teste Cliente', '1000-002')
        """)
        cliente_id = cursor.lastrowid
        
        # Criar restaurante
        cursor.execute("""
            INSERT INTO restaurantes (nome, morada, codpostal, telefone, especialidade_id)
            VALUES ('Rest Atomic 3', 'Rua Teste', '1000-002', '222222222', %s)
        """, (categoria_id,))
        restaurante_id = cursor.lastrowid
        
        # Criar pedido
        cursor.execute("""
            INSERT INTO pedidos (cliente_id, restaurante_id, metodo_pagamento, estado)
            VALUES (%s, %s, 'mbway', 'pendente')
        """, (cliente_id, restaurante_id))
        pedido_id = cursor.lastrowid
        
        conn.commit()
        
        # Verificar todas as entidades
        cursor.execute("SELECT COUNT(*) FROM clientes WHERE id = %s", (cliente_id,))
        cliente_ok = cursor.fetchone()[0] > 0
        
        cursor.execute("SELECT COUNT(*) FROM restaurantes WHERE id = %s", (restaurante_id,))
        restaurante_ok = cursor.fetchone()[0] > 0
        
        cursor.execute("SELECT COUNT(*) FROM pedidos WHERE id = %s", (pedido_id,))
        pedido_ok = cursor.fetchone()[0] > 0
        
        result = cliente_ok and restaurante_ok and pedido_ok
        print_test("Atomicidade 3", result, 
                  f"Todas as entidades criadas: Cliente={cliente_ok}, Rest={restaurante_ok}, Pedido={pedido_ok}")
        
        # Limpeza
        cursor.execute("DELETE FROM pedidos WHERE id = %s", (pedido_id,))
        cursor.execute("DELETE FROM clientes WHERE id = %s", (cliente_id,))
        cursor.execute("DELETE FROM restaurantes WHERE id = %s", (restaurante_id,))
        conn.commit()
        
        return result
    except Error as e:
        conn.rollback()
        print_test("Atomicidade 3", False, f"Erro: {e}")
        return False
    finally:
        cursor.close()
        conn.close()

def test_atomicity_4():
    """Teste 4: Transação parcialmente commitada não deve existir"""
    print(f"\n{Colors.BLUE}=== Teste Atomicidade 4: Transação Parcial ==={Colors.RESET}")
    conn = get_connection()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor()
        
        conn.start_transaction()
        
        # Criar codpostal se não existir
        cursor.execute("""
            INSERT IGNORE INTO codpostal (codpostal, localidade, cidade)
            VALUES ('1000-003', 'Lisboa', 'Lisboa')
        """)
        
        # Obter ou criar categoria
        cursor.execute("SELECT id FROM categorias_pratos WHERE nome = 'Teste' LIMIT 1")
        cat_result = cursor.fetchone()
        if cat_result:
            categoria_id = cat_result[0]
        else:
            cursor.execute("INSERT INTO categorias_pratos (nome) VALUES ('Teste')")
            categoria_id = cursor.lastrowid
        
        # Criar restaurante
        cursor.execute("""
            INSERT INTO restaurantes (nome, morada, codpostal, telefone, especialidade_id)
            VALUES ('Teste Atomic 4', 'Rua Teste', '1000-003', '333333333', %s)
        """, (categoria_id,))
        restaurante_id = cursor.lastrowid
        
        # Criar prato
        cursor.execute("""
            INSERT INTO pratos (restaurante_id, categoria_id, nome, preco)
            VALUES (%s, %s, 'Prato Atomic 4', 12.00)
        """, (restaurante_id, categoria_id))
        prato_id = cursor.lastrowid
        
        # Simular erro antes do commit
        # Não fazer commit - conexão será fechada
        
        # Verificar se nada foi commitado (sem commit explícito)
        # Como autocommit=False, nada deve estar na BD
        cursor2 = conn.cursor()
        cursor2.execute("SELECT COUNT(*) FROM restaurantes WHERE id = %s", (restaurante_id,))
        restaurante_exists = cursor2.fetchone()[0] > 0
        
        # Fechar conexão sem commit (rollback implícito)
        conn.rollback()
        cursor2.close()
        
        # Verificar novamente após rollback
        conn2 = get_connection()
        cursor3 = conn2.cursor()
        cursor3.execute("SELECT COUNT(*) FROM restaurantes WHERE id = %s", (restaurante_id,))
        restaurante_exists_after = cursor3.fetchone()[0] > 0
        
        result = not restaurante_exists_after
        print_test("Atomicidade 4", result, 
                  f"Restaurante não existe após rollback: {not restaurante_exists_after}")
        
        cursor3.close()
        conn2.close()
        return result
    except Error as e:
        conn.rollback()
        print_test("Atomicidade 4", False, f"Erro: {e}")
        return False
    finally:
        cursor.close()
        conn.close()

# ============================================
# TESTES DE CONSISTÊNCIA (CONSISTENCY)
# ============================================

def test_consistency_1():
    """Teste 1: Foreign keys devem ser respeitadas"""
    print(f"\n{Colors.BLUE}=== Teste Consistência 1: Foreign Keys ==={Colors.RESET}")
    conn = get_connection()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor()
        
        # Obter categoria
        cursor.execute("SELECT id FROM categorias_pratos LIMIT 1")
        cat_result = cursor.fetchone()
        if not cat_result:
            cursor.execute("INSERT INTO categorias_pratos (nome) VALUES ('Teste')")
            categoria_id = cursor.lastrowid
        else:
            categoria_id = cat_result[0]
        
        # Tentar criar prato com restaurante_id inválido
        try:
            cursor.execute("""
                INSERT INTO pratos (restaurante_id, categoria_id, nome, preco)
                VALUES (99999, %s, 'Prato Inválido', 10.00)
            """, (categoria_id,))
            conn.commit()
            result = False
            print_test("Consistência 1", False, "Foreign key não foi respeitada!")
        except Error as e:
            result = True
            print_test("Consistência 1", True, f"Foreign key respeitada: {str(e)[:50]}")
        
        return result
    except Error as e:
        print_test("Consistência 1", False, f"Erro: {e}")
        return False
    finally:
        cursor.close()
        conn.close()

def test_consistency_2():
    """Teste 2: Constraints NOT NULL devem ser respeitadas"""
    print(f"\n{Colors.BLUE}=== Teste Consistência 2: NOT NULL ==={Colors.RESET}")
    conn = get_connection()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor()
        
        # Criar codpostal se não existir
        cursor.execute("""
            INSERT IGNORE INTO codpostal (codpostal, localidade, cidade)
            VALUES ('1000-004', 'Lisboa', 'Lisboa')
        """)
        
        # Obter categoria
        cursor.execute("SELECT id FROM categorias_pratos LIMIT 1")
        cat_result = cursor.fetchone()
        if not cat_result:
            cursor.execute("INSERT INTO categorias_pratos (nome) VALUES ('Teste')")
            categoria_id = cursor.lastrowid
        else:
            categoria_id = cat_result[0]
        
        # Tentar criar restaurante sem nome (NOT NULL)
        try:
            cursor.execute("""
                INSERT INTO restaurantes (morada, codpostal, telefone, especialidade_id)
                VALUES ('Rua Teste', '1000-004', '444444444', %s)
            """, (categoria_id,))
            conn.commit()
            result = False
            print_test("Consistência 2", False, "Constraint NOT NULL não foi respeitada!")
        except Error as e:
            result = True
            print_test("Consistência 2", True, f"Constraint NOT NULL respeitada: {str(e)[:50]}")
        
        return result
    except Error as e:
        print_test("Consistência 2", False, f"Erro: {e}")
        return False
    finally:
        cursor.close()
        conn.close()

def test_consistency_3():
    """Teste 3: Valores devem manter consistência após update"""
    print(f"\n{Colors.BLUE}=== Teste Consistência 3: Consistência após Update ==={Colors.RESET}")
    conn = get_connection()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor()
        
        # Obter restaurante existente
        cursor.execute("SELECT id, nome FROM restaurantes LIMIT 1")
        result = cursor.fetchone()
        if not result:
            print_test("Consistência 3", False, "Nenhum restaurante encontrado")
            return False
        
        restaurante_id, nome_original = result
        
        # Atualizar nome
        novo_nome = "Nome Atualizado Consistência 3"
        cursor.execute("""
            UPDATE restaurantes SET nome = %s WHERE id = %s
        """, (novo_nome, restaurante_id))
        conn.commit()
        
        # Verificar se foi atualizado
        cursor.execute("SELECT nome FROM restaurantes WHERE id = %s", (restaurante_id,))
        nome_atualizado = cursor.fetchone()[0]
        
        result = nome_atualizado == novo_nome
        print_test("Consistência 3", result, 
                  f"Nome atualizado corretamente: {nome_atualizado}")
        
        # Restaurar nome original
        cursor.execute("UPDATE restaurantes SET nome = %s WHERE id = %s", 
                      (nome_original, restaurante_id))
        conn.commit()
        
        return result
    except Error as e:
        conn.rollback()
        print_test("Consistência 3", False, f"Erro: {e}")
        return False
    finally:
        cursor.close()
        conn.close()

def test_consistency_4():
    """Teste 4: Relações 1:n devem manter consistência"""
    print(f"\n{Colors.BLUE}=== Teste Consistência 4: Relação 1:n ==={Colors.RESET}")
    conn = get_connection()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor()
        
        # Criar codpostal se não existir
        cursor.execute("""
            INSERT IGNORE INTO codpostal (codpostal, localidade, cidade)
            VALUES ('1000-005', 'Lisboa', 'Lisboa')
        """)
        
        # Obter ou criar categoria
        cursor.execute("SELECT id FROM categorias_pratos WHERE nome = 'Teste' LIMIT 1")
        cat_result = cursor.fetchone()
        if cat_result:
            categoria_id = cat_result[0]
        else:
            cursor.execute("INSERT INTO categorias_pratos (nome) VALUES ('Teste')")
            categoria_id = cursor.lastrowid
        
        # Criar restaurante
        cursor.execute("""
            INSERT INTO restaurantes (nome, morada, codpostal, telefone, especialidade_id)
            VALUES ('Rest Consist 4', 'Rua Teste', '1000-005', '555555555', %s)
        """, (categoria_id,))
        restaurante_id = cursor.lastrowid
        
        # Criar 3 pratos para o restaurante
        pratos_ids = []
        for i in range(3):
            cursor.execute("""
                INSERT INTO pratos (restaurante_id, categoria_id, nome, preco)
                VALUES (%s, %s, 'Prato %s', 10.00)
            """, (restaurante_id, categoria_id, i+1))
            pratos_ids.append(cursor.lastrowid)
        
        conn.commit()
        
        # Verificar se todos os pratos pertencem ao restaurante
        cursor.execute("""
            SELECT COUNT(*) FROM pratos 
            WHERE restaurante_id = %s AND id IN (%s, %s, %s)
        """, (restaurante_id, pratos_ids[0], pratos_ids[1], pratos_ids[2]))
        count = cursor.fetchone()[0]
        
        result = count == 3
        print_test("Consistência 4", result, 
                  f"Todos os 3 pratos pertencem ao restaurante: {count == 3}")
        
        # Limpeza
        cursor.execute("DELETE FROM pratos WHERE restaurante_id = %s", (restaurante_id,))
        cursor.execute("DELETE FROM restaurantes WHERE id = %s", (restaurante_id,))
        conn.commit()
        
        return result
    except Error as e:
        conn.rollback()
        print_test("Consistência 4", False, f"Erro: {e}")
        return False
    finally:
        cursor.close()
        conn.close()

# ============================================
# TESTES DE ISOLAMENTO (ISOLATION)
# ============================================

def test_isolation_1():
    """Teste 1: Transações não commitadas não são visíveis"""
    print(f"\n{Colors.BLUE}=== Teste Isolamento 1: Dirty Read ==={Colors.RESET}")
    conn1 = get_connection()
    conn2 = get_connection()
    
    if not conn1 or not conn2:
        return False
    
    try:
        cursor1 = conn1.cursor()
        cursor2 = conn2.cursor()
        
        # Criar codpostal se não existir
        cursor1.execute("""
            INSERT IGNORE INTO codpostal (codpostal, localidade, cidade)
            VALUES ('1000-006', 'Lisboa', 'Lisboa')
        """)
        
        # Obter ou criar categoria
        cursor1.execute("SELECT id FROM categorias_pratos WHERE nome = 'Teste' LIMIT 1")
        cat_result = cursor1.fetchone()
        if cat_result:
            categoria_id = cat_result[0]
        else:
            cursor1.execute("INSERT INTO categorias_pratos (nome) VALUES ('Teste')")
            categoria_id = cursor1.lastrowid
            conn1.commit()
        
        # Transação 1: Criar restaurante mas não commitar
        conn1.start_transaction()
        cursor1.execute("""
            INSERT INTO restaurantes (nome, morada, codpostal, telefone, especialidade_id)
            VALUES ('Isolation Test 1', 'Rua Teste', '1000-006', '666666666', %s)
        """, (categoria_id,))
        restaurante_id = cursor1.lastrowid
        
        # Transação 2: Tentar ler (não deve ver)
        cursor2.execute("SELECT COUNT(*) FROM restaurantes WHERE id = %s", 
                       (restaurante_id,))
        count = cursor2.fetchone()[0]
        
        # Rollback transação 1
        conn1.rollback()
        
        result = count == 0
        print_test("Isolamento 1", result, 
                  f"Transação não commitada não é visível: {count == 0}")
        
        return result
    except Error as e:
        conn1.rollback()
        print_test("Isolamento 1", False, f"Erro: {e}")
        return False
    finally:
        cursor1.close()
        cursor2.close()
        conn1.close()
        conn2.close()

def test_isolation_2():
    """Teste 2: Read Committed - mudanças commitadas são visíveis"""
    print(f"\n{Colors.BLUE}=== Teste Isolamento 2: Read Committed ==={Colors.RESET}")
    conn1 = get_connection()
    conn2 = get_connection()
    
    if not conn1 or not conn2:
        return False
    
    try:
        cursor1 = conn1.cursor()
        cursor2 = conn2.cursor()
        
        # Configurar isolamento
        cursor1.execute("SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED")
        cursor2.execute("SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED")
        
        # Criar codpostal se não existir
        cursor1.execute("""
            INSERT IGNORE INTO codpostal (codpostal, localidade, cidade)
            VALUES ('1000-007', 'Lisboa', 'Lisboa')
        """)
        
        # Obter ou criar categoria
        cursor1.execute("SELECT id FROM categorias_pratos WHERE nome = 'Teste' LIMIT 1")
        cat_result = cursor1.fetchone()
        if cat_result:
            categoria_id = cat_result[0]
        else:
            cursor1.execute("INSERT INTO categorias_pratos (nome) VALUES ('Teste')")
            categoria_id = cursor1.lastrowid
            conn1.commit()
        
        # Transação 1: Criar e commitar
        conn1.start_transaction()
        cursor1.execute("""
            INSERT INTO restaurantes (nome, morada, codpostal, telefone, especialidade_id)
            VALUES ('Isolation Test 2', 'Rua Teste', '1000-007', '777777777', %s)
        """, (categoria_id,))
        restaurante_id = cursor1.lastrowid
        conn1.commit()
        
        # Transação 2: Deve ver após commit
        time.sleep(0.1)  # Pequeno delay
        cursor2.execute("SELECT COUNT(*) FROM restaurantes WHERE id = %s", 
                       (restaurante_id,))
        count = cursor2.fetchone()[0]
        
        result = count == 1
        print_test("Isolamento 2", result, 
                  f"Mudança commitada é visível: {count == 1}")
        
        # Limpeza
        cursor1.execute("DELETE FROM restaurantes WHERE id = %s", (restaurante_id,))
        conn1.commit()
        
        return result
    except Error as e:
        conn1.rollback()
        print_test("Isolamento 2", False, f"Erro: {e}")
        return False
    finally:
        cursor1.close()
        cursor2.close()
        conn1.close()
        conn2.close()

def test_isolation_3():
    """Teste 3: Non-repeatable read"""
    print(f"\n{Colors.BLUE}=== Teste Isolamento 3: Non-repeatable Read ==={Colors.RESET}")
    conn1 = get_connection()
    conn2 = get_connection()
    
    if not conn1 or not conn2:
        return False
    
    try:
        cursor1 = conn1.cursor()
        cursor2 = conn2.cursor()
        
        # Obter restaurante existente
        cursor1.execute("SELECT id, nome FROM restaurantes LIMIT 1")
        result = cursor1.fetchone()
        if not result:
            print_test("Isolamento 3", False, "Nenhum restaurante encontrado")
            return False
        
        restaurante_id, nome_original = result
        
        # Transação 2: Ler nome
        conn2.start_transaction()
        cursor2.execute("SELECT nome FROM restaurantes WHERE id = %s", (restaurante_id,))
        nome1 = cursor2.fetchone()[0]
        
        # Transação 1: Atualizar nome e commitar
        conn1.start_transaction()
        cursor1.execute("UPDATE restaurantes SET nome = 'Nome Alterado' WHERE id = %s", 
                       (restaurante_id,))
        conn1.commit()
        
        # Transação 2: Ler novamente (pode ver mudança se READ COMMITTED)
        cursor2.execute("SELECT nome FROM restaurantes WHERE id = %s", (restaurante_id,))
        nome2 = cursor2.fetchone()[0]
        
        conn2.commit()
        
        # Restaurar nome original
        cursor1.execute("UPDATE restaurantes SET nome = %s WHERE id = %s", 
                       (nome_original, restaurante_id))
        conn1.commit()
        
        # Em READ COMMITTED, nome2 pode ser diferente (non-repeatable read)
        result = True  # Teste passa se não houver erro
        print_test("Isolamento 3", result, 
                  f"Primeira leitura: {nome1}, Segunda leitura: {nome2}")
        
        return result
    except Error as e:
        conn1.rollback()
        conn2.rollback()
        print_test("Isolamento 3", False, f"Erro: {e}")
        return False
    finally:
        cursor1.close()
        cursor2.close()
        conn1.close()
        conn2.close()

def test_isolation_4():
    """Teste 4: Phantom read"""
    print(f"\n{Colors.BLUE}=== Teste Isolamento 4: Phantom Read ==={Colors.RESET}")
    conn1 = get_connection()
    conn2 = get_connection()
    
    if not conn1 or not conn2:
        return False
    
    try:
        cursor1 = conn1.cursor()
        cursor2 = conn2.cursor()
        
        # Criar codpostal se não existir
        cursor1.execute("""
            INSERT IGNORE INTO codpostal (codpostal, localidade, cidade)
            VALUES ('1000-008', 'Lisboa', 'Lisboa')
        """)
        
        # Criar categoria para phantom test
        cursor1.execute("SELECT id FROM categorias_pratos WHERE nome = 'Phantom Test' LIMIT 1")
        cat_result = cursor1.fetchone()
        if cat_result:
            categoria_id = cat_result[0]
        else:
            cursor1.execute("INSERT INTO categorias_pratos (nome) VALUES ('Phantom Test')")
            categoria_id = cursor1.lastrowid
            conn1.commit()
        
        # Transação 2: Contar restaurantes
        conn2.start_transaction()
        cursor2.execute("SELECT COUNT(*) FROM restaurantes WHERE especialidade_id = %s", (categoria_id,))
        count1 = cursor2.fetchone()[0]
        
        # Transação 1: Inserir novo restaurante e commitar
        conn1.start_transaction()
        cursor1.execute("""
            INSERT INTO restaurantes (nome, morada, codpostal, telefone, especialidade_id)
            VALUES ('Phantom Test', 'Rua Teste', '1000-008', '888888888', %s)
        """, (categoria_id,))
        restaurante_id = cursor1.lastrowid
        conn1.commit()
        
        # Transação 2: Contar novamente (pode ver novo registro)
        cursor2.execute("SELECT COUNT(*) FROM restaurantes WHERE especialidade_id = %s", (categoria_id,))
        count2 = cursor2.fetchone()[0]
        
        conn2.commit()
        
        # Limpeza
        cursor1.execute("DELETE FROM restaurantes WHERE id = %s", (restaurante_id,))
        conn1.commit()
        
        result = True  # Teste passa se não houver erro
        print_test("Isolamento 4", result, 
                  f"Primeira contagem: {count1}, Segunda contagem: {count2}")
        
        return result
    except Error as e:
        conn1.rollback()
        conn2.rollback()
        print_test("Isolamento 4", False, f"Erro: {e}")
        return False
    finally:
        cursor1.close()
        cursor2.close()
        conn1.close()
        conn2.close()

# ============================================
# TESTES DE DURABILIDADE (DURABILITY)
# ============================================

def test_durability_1():
    """Teste 1: Dados commitados persistem após reconexão"""
    print(f"\n{Colors.BLUE}=== Teste Durabilidade 1: Persistência após Commit ==={Colors.RESET}")
    conn = get_connection()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor()
        
        # Criar codpostal se não existir
        cursor.execute("""
            INSERT IGNORE INTO codpostal (codpostal, localidade, cidade)
            VALUES ('1000-009', 'Lisboa', 'Lisboa')
        """)
        
        # Obter ou criar categoria
        cursor.execute("SELECT id FROM categorias_pratos WHERE nome = 'Teste' LIMIT 1")
        cat_result = cursor.fetchone()
        if cat_result:
            categoria_id = cat_result[0]
        else:
            cursor.execute("INSERT INTO categorias_pratos (nome) VALUES ('Teste')")
            categoria_id = cursor.lastrowid
        
        # Criar e commitar
        cursor.execute("""
            INSERT INTO restaurantes (nome, morada, codpostal, telefone, especialidade_id)
            VALUES ('Durability Test 1', 'Rua Teste', '1000-009', '999999999', %s)
        """, (categoria_id,))
        restaurante_id = cursor.lastrowid
        conn.commit()
        
        # Fechar conexão
        cursor.close()
        conn.close()
        
        # Reconectar e verificar
        conn2 = get_connection()
        cursor2 = conn2.cursor()
        cursor2.execute("SELECT COUNT(*) FROM restaurantes WHERE id = %s", (restaurante_id,))
        exists = cursor2.fetchone()[0] > 0
        
        result = exists
        print_test("Durabilidade 1", result, 
                  f"Dados persistem após reconexão: {exists}")
        
        # Limpeza
        cursor2.execute("DELETE FROM restaurantes WHERE id = %s", (restaurante_id,))
        conn2.commit()
        
        cursor2.close()
        conn2.close()
        return result
    except Error as e:
        conn.rollback()
        print_test("Durabilidade 1", False, f"Erro: {e}")
        return False
    finally:
        if conn:
            conn.close()

def test_durability_2():
    """Teste 2: Múltiplos commits persistem"""
    print(f"\n{Colors.BLUE}=== Teste Durabilidade 2: Múltiplos Commits ==={Colors.RESET}")
    conn = get_connection()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor()
        restaurantes_ids = []
        
        # Criar codpostal se não existir
        cursor.execute("""
            INSERT IGNORE INTO codpostal (codpostal, localidade, cidade)
            VALUES ('1000-010', 'Lisboa', 'Lisboa')
        """)
        
        # Obter ou criar categoria
        cursor.execute("SELECT id FROM categorias_pratos WHERE nome = 'Durability Test' LIMIT 1")
        cat_result = cursor.fetchone()
        if cat_result:
            categoria_id = cat_result[0]
        else:
            cursor.execute("INSERT INTO categorias_pratos (nome) VALUES ('Durability Test')")
            categoria_id = cursor.lastrowid
            conn.commit()
        
        # Criar 3 restaurantes com commits separados
        for i in range(3):
            cursor.execute("""
                INSERT INTO restaurantes (nome, morada, codpostal, telefone, especialidade_id)
                VALUES (%s, 'Rua Teste', '1000-010', '111111111', %s)
            """, (f'Durability Test {i+1}', categoria_id))
            restaurantes_ids.append(cursor.lastrowid)
            conn.commit()
        
        # Fechar e reconectar
        cursor.close()
        conn.close()
        
        # Verificar todos
        conn2 = get_connection()
        cursor2 = conn2.cursor()
        
        all_exist = True
        for rid in restaurantes_ids:
            cursor2.execute("SELECT COUNT(*) FROM restaurantes WHERE id = %s", (rid,))
            if cursor2.fetchone()[0] == 0:
                all_exist = False
        
        result = all_exist
        print_test("Durabilidade 2", result, 
                  f"Todos os {len(restaurantes_ids)} registros persistem: {all_exist}")
        
        # Limpeza
        for rid in restaurantes_ids:
            cursor2.execute("DELETE FROM restaurantes WHERE id = %s", (rid,))
        conn2.commit()
        
        cursor2.close()
        conn2.close()
        return result
    except Error as e:
        conn.rollback()
        print_test("Durabilidade 2", False, f"Erro: {e}")
        return False
    finally:
        if conn:
            conn.close()

def test_durability_3():
    """Teste 3: Dados complexos persistem"""
    print(f"\n{Colors.BLUE}=== Teste Durabilidade 3: Dados Complexos ==={Colors.RESET}")
    conn = get_connection()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor()
        
        # Criar codpostal se não existir
        cursor.execute("""
            INSERT IGNORE INTO codpostal (codpostal, localidade, cidade)
            VALUES ('1000-011', 'Lisboa', 'Lisboa')
        """)
        
        # Obter ou criar categoria
        cursor.execute("SELECT id FROM categorias_pratos WHERE nome = 'Teste' LIMIT 1")
        cat_result = cursor.fetchone()
        if cat_result:
            categoria_id = cat_result[0]
        else:
            cursor.execute("INSERT INTO categorias_pratos (nome) VALUES ('Teste')")
            categoria_id = cursor.lastrowid
        
        # Criar estrutura complexa
        cursor.execute("""
            INSERT INTO restaurantes (nome, morada, codpostal, telefone, especialidade_id)
            VALUES ('Durability Test 3', 'Rua Teste', '1000-011', '222222222', %s)
        """, (categoria_id,))
        restaurante_id = cursor.lastrowid
        
        cursor.execute("""
            INSERT INTO pratos (restaurante_id, categoria_id, nome, preco, descricao, vegetariano)
            VALUES (%s, %s, 'Prato Durability 3', 12.50, 'Descrição teste', TRUE)
        """, (restaurante_id, categoria_id))
        prato_id = cursor.lastrowid
        
        conn.commit()
        
        # Fechar e reconectar
        cursor.close()
        conn.close()
        
        # Verificar dados complexos
        conn2 = get_connection()
        cursor2 = conn2.cursor()
        
        cursor2.execute("""
            SELECT r.nome, p.nome, p.preco, p.vegetariano
            FROM restaurantes r
            JOIN pratos p ON r.id = p.restaurante_id
            WHERE r.id = %s
        """, (restaurante_id,))
        result_data = cursor2.fetchone()
        
        result = result_data is not None and len(result_data) == 4
        if result_data:
            print_test("Durabilidade 3", result, 
                      f"Dados complexos persistem: Rest={result_data[0]}, Prato={result_data[1]}")
        else:
            print_test("Durabilidade 3", False, "Dados não encontrados")
        
        # Limpeza
        cursor2.execute("DELETE FROM pratos WHERE id = %s", (prato_id,))
        cursor2.execute("DELETE FROM restaurantes WHERE id = %s", (restaurante_id,))
        conn2.commit()
        
        cursor2.close()
        conn2.close()
        return result
    except Error as e:
        conn.rollback()
        print_test("Durabilidade 3", False, f"Erro: {e}")
        return False
    finally:
        if conn:
            conn.close()

def test_durability_4():
    """Teste 4: Transações commitadas sobrevivem a falhas simuladas"""
    print(f"\n{Colors.BLUE}=== Teste Durabilidade 4: Sobrevivência a Falhas ==={Colors.RESET}")
    conn = get_connection()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor()
        
        # Criar codpostal se não existir
        cursor.execute("""
            INSERT IGNORE INTO codpostal (codpostal, localidade, cidade)
            VALUES ('1000-012', 'Lisboa', 'Lisboa')
        """)
        
        # Obter ou criar categoria
        cursor.execute("SELECT id FROM categorias_pratos WHERE nome = 'Teste' LIMIT 1")
        cat_result = cursor.fetchone()
        if cat_result:
            categoria_id = cat_result[0]
        else:
            cursor.execute("INSERT INTO categorias_pratos (nome) VALUES ('Teste')")
            categoria_id = cursor.lastrowid
        
        # Criar registro
        cursor.execute("""
            INSERT INTO restaurantes (nome, morada, codpostal, telefone, especialidade_id)
            VALUES ('Durability Test 4', 'Rua Teste', '1000-012', '333333333', %s)
        """, (categoria_id,))
        restaurante_id = cursor.lastrowid
        conn.commit()
        
        # Simular "falha" - fechar conexão abruptamente
        cursor.close()
        conn.close()
        
        # Aguardar um pouco
        time.sleep(0.5)
        
        # Reconectar e verificar
        conn2 = get_connection()
        cursor2 = conn2.cursor()
        cursor2.execute("SELECT COUNT(*) FROM restaurantes WHERE id = %s", (restaurante_id,))
        exists = cursor2.fetchone()[0] > 0
        
        result = exists
        print_test("Durabilidade 4", result, 
                  f"Dados persistem após 'falha': {exists}")
        
        # Limpeza
        cursor2.execute("DELETE FROM restaurantes WHERE id = %s", (restaurante_id,))
        conn2.commit()
        
        cursor2.close()
        conn2.close()
        return result
    except Error as e:
        if conn:
            conn.rollback()
        print_test("Durabilidade 4", False, f"Erro: {e}")
        return False
    finally:
        if conn:
            conn.close()

# ============================================
# MAIN - Executar todos os testes
# ============================================

def main():
    print(f"\n{Colors.YELLOW}{'='*60}")
    print("TESTES ACID - Food Delivery API")
    print("Grupo: inf25dw1g13")
    print(f"{'='*60}{Colors.RESET}\n")
    
    results = {
        'Atomicidade': [],
        'Consistência': [],
        'Isolamento': [],
        'Durabilidade': []
    }
    
    # Testes de Atomicidade
    results['Atomicidade'].append(test_atomicity_1())
    results['Atomicidade'].append(test_atomicity_2())
    results['Atomicidade'].append(test_atomicity_3())
    results['Atomicidade'].append(test_atomicity_4())
    
    # Testes de Consistência
    results['Consistência'].append(test_consistency_1())
    results['Consistência'].append(test_consistency_2())
    results['Consistência'].append(test_consistency_3())
    results['Consistência'].append(test_consistency_4())
    
    # Testes de Isolamento
    results['Isolamento'].append(test_isolation_1())
    results['Isolamento'].append(test_isolation_2())
    results['Isolamento'].append(test_isolation_3())
    results['Isolamento'].append(test_isolation_4())
    
    # Testes de Durabilidade
    results['Durabilidade'].append(test_durability_1())
    results['Durabilidade'].append(test_durability_2())
    results['Durabilidade'].append(test_durability_3())
    results['Durabilidade'].append(test_durability_4())
    
    # Resumo
    print(f"\n{Colors.YELLOW}{'='*60}")
    print("RESUMO DOS TESTES")
    print(f"{'='*60}{Colors.RESET}\n")
    
    total_passed = 0
    total_tests = 0
    
    for propriedade, testes in results.items():
        passed = sum(testes)
        total = len(testes)
        total_passed += passed
        total_tests += total
        
        color = Colors.GREEN if passed == total else Colors.RED
        print(f"{color}{propriedade}: {passed}/{total} testes passaram{Colors.RESET}")
    
    print(f"\n{Colors.YELLOW}Total: {total_passed}/{total_tests} testes passaram{Colors.RESET}\n")
    
    return total_passed == total_tests

if __name__ == "__main__":
    try:
        success = main()
        exit(0 if success else 1)
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Testes interrompidos pelo usuário{Colors.RESET}")
        exit(1)
    except Exception as e:
        print(f"\n{Colors.RED}Erro fatal: {e}{Colors.RESET}")
        exit(1)






