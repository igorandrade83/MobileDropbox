package app.entity;

import java.io.*;
import javax.persistence.*;
import java.util.*;
import javax.xml.bind.annotation.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonFilter;
import cronapi.rest.security.CronappSecurity;
import cronapi.CronapiCloud;


/**
 * Classe que representa a tabela FOTO
 * @generated
 */
@Entity
@Table(name = "\"FOTO\"")
@XmlRootElement
@CronappSecurity
@JsonFilter("app.entity.foto")
public class foto implements Serializable {

  /**
   * UID da classe, necessário na serialização
   * @generated
   */
  private static final long serialVersionUID = 1L;

  /**
   * @generated
   */
  @Id
  @Column(name = "id", nullable = false, insertable=true, updatable=true)
  private java.lang.String id = UUID.randomUUID().toString().toUpperCase();

  /**
  * @generated
  */
  @Temporal(TemporalType.TIMESTAMP)
  @Column(name = "data", nullable = true, unique = false, insertable=true, updatable=true)
  
  private java.util.Date data = new Date(System.currentTimeMillis());

  /**
  * @generated
  */
  @Column(name = "captura", nullable = true, unique = false, insertable=true, updatable=true)
  @CronapiCloud(type = "dropbox", value="nKzYCnc-1M8AAAAAAAAAVtE3jyzavIk6V6FWSYRDkYE7PbDcb224heApemtVdiFp")
  
  private java.lang.String captura;

  /**
  * @generated
  */
  @ManyToOne
  @JoinColumn(name="fk_disciplina", nullable = true, referencedColumnName = "id", insertable=true, updatable=true)
  
  private disciplina disciplina;

  /**
   * Construtor
   * @generated
   */
  public foto(){
  }


  /**
   * Obtém id
   * return id
   * @generated
   */
  
  public java.lang.String getId(){
    return this.id;
  }

  /**
   * Define id
   * @param id id
   * @generated
   */
  public foto setId(java.lang.String id){
    this.id = id;
    return this;
  }

  /**
   * Obtém data
   * return data
   * @generated
   */
  
  public java.util.Date getData(){
    return this.data;
  }

  /**
   * Define data
   * @param data data
   * @generated
   */
  public foto setData(java.util.Date data){
    this.data = data;
    return this;
  }

  /**
   * Obtém captura
   * return captura
   * @generated
   */
  
  public java.lang.String getCaptura(){
    return this.captura;
  }

  /**
   * Define captura
   * @param captura captura
   * @generated
   */
  public foto setCaptura(java.lang.String captura){
    this.captura = captura;
    return this;
  }

  /**
   * Obtém disciplina
   * return disciplina
   * @generated
   */
  
  public disciplina getDisciplina(){
    return this.disciplina;
  }

  /**
   * Define disciplina
   * @param disciplina disciplina
   * @generated
   */
  public foto setDisciplina(disciplina disciplina){
    this.disciplina = disciplina;
    return this;
  }

  /**
   * @generated
   */
  @Override
  public boolean equals(Object obj) {
    if (this == obj) return true;
    if (obj == null || getClass() != obj.getClass()) return false;
    foto object = (foto)obj;
    if (id != null ? !id.equals(object.id) : object.id != null) return false;
    return true;
  }

  /**
   * @generated
   */
  @Override
  public int hashCode() {
    int result = 1;
    result = 31 * result + ((id == null) ? 0 : id.hashCode());
    return result;
  }

}
