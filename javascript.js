class Char {
  health = 100;
  isDead = false;
  power = 25;
  defence = 5;
  Dead() {
    if (this.health<=0) this.isDead = true
  }

  Attack(enemy) {
    enemy.health = enemy.health - (this.power-enemy.defence);
    enemy.Dead()
  }
}
 let biba = new Char;
 console.log(biba.isDead);
 biba.Dead();
 console.log(biba.isDead);
 
 let boba = new Char;
 boba.health = 50;
 console.log(biba, boba);
 biba.Attack(boba);
 console.log(biba, boba);
 biba.Attack(boba);
 biba.Attack(boba);
 console.log(boba);
