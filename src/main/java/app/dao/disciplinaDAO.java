package app.dao;

import app.entity.*;
import java.util.*;
import org.springframework.stereotype.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.domain.*;
import org.springframework.data.repository.query.*;
import org.springframework.transaction.annotation.*; 


/**
 * Realiza operação de Create, Read, Update e Delete no banco de dados.
 * Os métodos de create, edit, delete e outros estão abstraídos no JpaRepository
 * 
 * @see org.springframework.data.jpa.repository.JpaRepository
 * 
 * @generated
 */
@Repository("disciplinaDAO")
@Transactional(transactionManager="app-TransactionManager")
public interface disciplinaDAO extends JpaRepository<disciplina, java.lang.String> {

  /**
   * Obtém a instância de disciplina utilizando os identificadores
   * 
   * @param id
   *          Identificador 
   * @return Instância relacionada com o filtro indicado
   * @generated
   */    
  @Query("SELECT entity FROM disciplina entity WHERE entity.id = :id")
  public disciplina findOne(@Param(value="id") java.lang.String id);

  /**
   * Remove a instância de disciplina utilizando os identificadores
   * 
   * @param id
   *          Identificador 
   * @return Quantidade de modificações efetuadas
   * @generated
   */    
  @Modifying
  @Query("DELETE FROM disciplina entity WHERE entity.id = :id")
  public void delete(@Param(value="id") java.lang.String id);



  /**
   * OneToMany Relation
   * @generated
   */
  @Query("SELECT entity FROM foto entity WHERE entity.disciplina.id = :id")
  public Page<foto> findFoto(@Param(value="id") java.lang.String id, Pageable pageable);

  
  /**
   * Searchable fields - General search (Only strings fields)
   * @generated
   */
  @Query("SELECT entity FROM disciplina entity WHERE entity.nome like concat('%',coalesce(:search,''),'%')")
  public Page<disciplina> generalSearch(@Param(value="search") java.lang.String search, Pageable pageable);

  /**
   * Searchable fields - Specific search
   * @generated
   */
  @Query("SELECT entity FROM disciplina entity WHERE (:nome is null OR entity.nome like concat('%',:nome,'%'))")
  public Page<disciplina> specificSearch(@Param(value="nome") java.lang.String nome, Pageable pageable);
  
}
