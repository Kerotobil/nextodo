/// <reference types="cypress" />

describe('example to-do app', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000')
  })
  it('新規Todoを追加できる', () => {
    cy.get('.new-todo').eq(0).click()
    cy.get('input').first().type('テスト{enter}')
    cy.get('.todo-container > div').eq(4).should('have.text', 'テスト')
  })
  it('Todoを削除できる', () => {
    cy.get('.todo-container > div').eq(0).trigger('mouseover')
    cy.get('.todo-container > div > svg').eq(0).click()
    cy.get('.todo-container > div').should('have.length', 3)
  })
})
