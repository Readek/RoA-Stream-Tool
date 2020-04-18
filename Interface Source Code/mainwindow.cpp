#include "mainwindow.h"
#include "ui_mainwindow.h"
#include <QFile>
#include <QTextStream>
#include <QMessageBox>
#include <QShortcut>
#include <QJsonObject>
#include <QJsonDocument>

MainWindow::MainWindow(QWidget *parent) :
    QMainWindow(parent),
    ui(new Ui::MainWindow)
{
    ui->setupUi(this);

    //this loads the Characters.txt list on the character combo boxes on startup
    ui->comboBox->clear();
    ui->comboBox_4->clear();
    QString path = "Resources/Texts/Interface Lists/Characters.txt";
    QFile txt(path);

    if (!txt.open(QFile::ReadOnly | QFile::Text))
    {
        QMessageBox::warning(this, "Oh no", "Coudn't find the character lists.");
    }

    QTextStream in(&txt);
    while (!in.atEnd())
    {
        QString line = in.readLine();
        ui->comboBox->addItem(line);
        ui->comboBox_4->addItem(line);
    }

    txt.flush();
    txt.close();

    //disable [W] and [L] at startup
    ui->checkWP1->setEnabled(false);
    ui->checkLP1->setEnabled(false);
    ui->checkWP2->setEnabled(false);
    ui->checkLP2->setEnabled(false);

    //placeholder texts
    ui->lineEdit->setPlaceholderText("Player 1");
    ui->lineEdit_2->setPlaceholderText("Player 2");
    ui->lineEdit_3->setPlaceholderText("Current Round");
    ui->tournamentText->setPlaceholderText("Tournament Name");

    //set starting selection of player 2 color to blue
    ui->comboBox_6->setCurrentIndex(1);
}

MainWindow::~MainWindow()
{
    delete ui;
}


//swap button
void MainWindow::on_pushButton_5_clicked()
{
    //Player texts
    QString currentPlayer1 = ui->lineEdit->text();
    QString currentPlayer2 = ui->lineEdit_2->text();
    ui->lineEdit->setText(currentPlayer2);
    ui->lineEdit_2->setText(currentPlayer1);

    //character and skin
    int currentCharacter1 = ui->comboBox->currentIndex();
    int currentCharacter2 = ui->comboBox_4->currentIndex();
    int currentSkin1 = ui->comboBox_2->currentIndex();
    int currentSkin2 = ui->comboBox_3->currentIndex();
    ui->comboBox->setCurrentIndex(currentCharacter2);
    ui->comboBox_4->setCurrentIndex(currentCharacter1);
    ui->comboBox_2->setCurrentIndex(currentSkin2);
    ui->comboBox_3->setCurrentIndex(currentSkin1);

    //grand finals status
    if (ui->checkWP1->isChecked())
    {
        ui->checkWP1->setChecked(false);
        ui->checkLP1->setChecked(true);
        ui->checkWP2->setChecked(true);
        ui->checkLP2->setChecked(false);
    }
    else if (ui->checkLP1->isChecked())
    {
        ui->checkWP1->setChecked(true);
        ui->checkLP1->setChecked(false);
        ui->checkWP2->setChecked(false);
        ui->checkLP2->setChecked(true);
    }

    //this is for the score ticks, coudnt really find a better way...
    int p1score;
    if (ui->CheckWinP1_3->isChecked())
    {
        p1score = 3;
    }
    else if (ui->CheckWinP1_2->isChecked())
    {
        p1score = 2;
    }
    else if (ui->CheckWinP1_1->isChecked())
    {
        p1score = 1;
    }
    else
    {
        p1score = 0;
    }

    //player 1 score
    if (ui->CheckWinP2_3->isChecked())
    {
        ui->CheckWinP1_3->setChecked(true);
        ui->CheckWinP1_2->setChecked(true);
        ui->CheckWinP1_1->setChecked(true);
    }
    else if (ui->CheckWinP2_2->isChecked())
    {
        ui->CheckWinP1_3->setChecked(false);
        ui->CheckWinP1_2->setChecked(true);
        ui->CheckWinP1_1->setChecked(true);
    }
    else if (ui->CheckWinP2_1->isChecked())
    {
        ui->CheckWinP1_3->setChecked(false);
        ui->CheckWinP1_2->setChecked(false);
        ui->CheckWinP1_1->setChecked(true);
    }
    else
    {
        ui->CheckWinP1_3->setChecked(false);
        ui->CheckWinP1_2->setChecked(false);
        ui->CheckWinP1_1->setChecked(false);
    }

    //player 2 score
    if (p1score == 3)
    {
        ui->CheckWinP2_3->setChecked(true);
        ui->CheckWinP2_2->setChecked(true);
        ui->CheckWinP2_1->setChecked(true);
    }
    else if (p1score == 2)
    {
        ui->CheckWinP2_3->setChecked(false);
        ui->CheckWinP2_2->setChecked(true);
        ui->CheckWinP2_1->setChecked(true);
    }
    else if (p1score == 1)
    {
        ui->CheckWinP2_3->setChecked(false);
        ui->CheckWinP2_2->setChecked(false);
        ui->CheckWinP2_1->setChecked(true);
    }
    else
    {
        ui->CheckWinP2_3->setChecked(false);
        ui->CheckWinP2_2->setChecked(false);
        ui->CheckWinP2_1->setChecked(false);
    }
}

//P1 combo box list
void MainWindow::on_comboBox_currentIndexChanged(const QString &arg1)
{
    ui->comboBox_2->clear();
    QString character = ui->comboBox->currentText();
    QString player = ui->lineEdit->text();
    //this is so it doesnt read the player team tag
    QStringList pSplit = player.split("|");
    if (pSplit.length() == 2)
    {
        player = pSplit[1];
    }
    else
    {
        player = pSplit[0];
    }

    //now we will check the skin list txt files and add an entry line by line

    //this down here is for the exclusive player skins
    QString pathc = "Resources/Texts/Interface Lists/Player Skins/" + character + ".txt";
    QFile txtc(pathc);

    if (!txtc.open(QFile::ReadOnly | QFile::Text))
    {
        //i was going to include error messages here but they would show on startup
    }

    QTextStream inc(&txtc);
    while (!inc.atEnd())
    {
        QString line = inc.readLine();
        if (player == "")
        {
            //this is to prevent it from adding an empty option to the combo box in case there is no player name
        }
        else if (line.contains(player, Qt::CaseInsensitive))
        {
            ui->comboBox_2->addItem(player);
        }
    }

    txtc.flush();
    txtc.close();


    //now for the normal skins
    QString path = "Resources/Texts/Interface Lists/Skin Lists/" + character + ".txt";
    QFile txt(path);

    if (!txt.open(QFile::ReadOnly | QFile::Text))
    {
        //i was going to include error messages here but they would show on startup
    }

    QTextStream in(&txt);
    while (!in.atEnd())
    {
        QString line = in.readLine();
        ui->comboBox_2->addItem(line);
    }

    txt.flush();
    txt.close();
}

//this is copied from P1's (above's) code, changing some numbers
void MainWindow::on_comboBox_4_currentIndexChanged(const QString &arg1)
{
    ui->comboBox_3->clear();
    QString character = ui->comboBox_4->currentText();
    QString player = ui->lineEdit_2->text();

    QStringList pSplit = player.split("|");
    if (pSplit.length() == 2)
    {
        player = pSplit[1];
    }
    else
    {
        player = pSplit[0];
    }


    QString pathc = "Resources/Texts/Interface Lists/Player Skins/" + character + ".txt";
    QFile txtc(pathc);

    if (!txtc.open(QFile::ReadOnly | QFile::Text))
    {
        //i was going to include error messages here but they would show on startup
    }

    QTextStream inc(&txtc);
    while (!inc.atEnd())
    {
        QString line = inc.readLine();
        if (player == "")
        {
            //this is to prevent it from adding an empty option to the combo box in case there is no player name
        }
        else if (line.contains(player, Qt::CaseInsensitive))
        {
            ui->comboBox_3->addItem(player);
        }
    }

    txtc.flush();
    txtc.close();


    QString path = "Resources/Texts/Interface Lists/Skin Lists/" + character + ".txt";
    QFile txt(path);

    if (!txt.open(QFile::ReadOnly | QFile::Text))
    {
        //i was going to include error messages here but they would show on startup
    }

    QTextStream in(&txt);
    while (!in.atEnd())
    {
        QString line = in.readLine();
        ui->comboBox_3->addItem(line);
    }

    txt.flush();
    txt.close();
}


//this is just so you dont have to press every checkbox to set the player's score directly to 3
void MainWindow::on_CheckWinP1_1_clicked()
{
    ui->CheckWinP1_2->setChecked(false);
    ui->CheckWinP1_3->setChecked(false);
}
void MainWindow::on_CheckWinP1_2_clicked()
{
    ui->CheckWinP1_1->setChecked(true);
    ui->CheckWinP1_3->setChecked(false);
}
void MainWindow::on_CheckWinP1_3_clicked()
{
    ui->CheckWinP1_1->setChecked(true);
    ui->CheckWinP1_2->setChecked(true);
}
void MainWindow::on_CheckWinP2_1_clicked()
{
    ui->CheckWinP2_2->setChecked(false);
    ui->CheckWinP2_3->setChecked(false);
}
void MainWindow::on_CheckWinP2_2_clicked()
{
    ui->CheckWinP2_1->setChecked(true);
    ui->CheckWinP2_3->setChecked(false);
}
void MainWindow::on_CheckWinP2_3_clicked()
{
    ui->CheckWinP2_1->setChecked(true);
    ui->CheckWinP2_2->setChecked(true);
}


//if the set is bo3, disable the third score tick of both players
void MainWindow::on_radioButton_clicked()
{
    if (ui->radioButton->isChecked())
    {
        ui->CheckWinP1_3->setChecked(false);
        ui->CheckWinP1_3->setEnabled(false);
        ui->CheckWinP2_3->setChecked(false);
        ui->CheckWinP2_3->setEnabled(false);
    }
}
void MainWindow::on_radioButton_2_clicked()
{
    if (ui->radioButton_2->isChecked())
    {
        ui->CheckWinP1_3->setEnabled(true);
        ui->CheckWinP2_3->setEnabled(true);
    }
}


//checks if the current round is grand finals, to enable the [W] and [L] buttons
void MainWindow::on_lineEdit_3_textChanged(const QString &arg1)
{
    if (ui->lineEdit_3->text().contains("grand", Qt::CaseInsensitive))
    {
        ui->checkWP1->setEnabled(true);
        ui->checkLP1->setEnabled(true);
        ui->checkWP2->setEnabled(true);
        ui->checkLP2->setEnabled(true);
    }
    else
    {
        ui->checkWP1->setChecked(false);
        ui->checkLP1->setChecked(false);
        ui->checkWP2->setChecked(false);
        ui->checkLP2->setChecked(false);
        ui->checkWP1->setEnabled(false);
        ui->checkLP1->setEnabled(false);
        ui->checkWP2->setEnabled(false);
        ui->checkLP2->setEnabled(false);
    }
}

//i dont know how radio button groups work so im just faking it...
void MainWindow::on_checkLP1_clicked()
{
    ui->checkWP1->setChecked(false);
}

void MainWindow::on_checkWP1_clicked()
{
    ui->checkLP1->setChecked(false);
}

void MainWindow::on_checkWP2_clicked()
{
    ui->checkLP2->setChecked(false);
}

void MainWindow::on_checkLP2_clicked()
{
    ui->checkWP2->setChecked(false);
}


//and this is where the text file update magic happens
void MainWindow::on_buttonUpdate_clicked()
{
    //these only update the normal txt files for optional obs use
    MainWindow::updateP1();
    MainWindow::updateP2();
    MainWindow::updateRound();
    MainWindow::updateCasters();


    //now for the fun part
    QJsonObject jsonData;


    //player name
    QString p1FullName = ui->lineEdit->text();
    QStringList pSplit = p1FullName.split("|");
    if (pSplit.length() == 2)
    {
        jsonData["p1Name"] = pSplit[1];
        jsonData["p1Team"] = pSplit[0];
    }
    else
    {
        jsonData["p1Name"] = pSplit[0];
        jsonData["p1Team"] = "";
    }

    //this is for the player's score, not fancy i know i know
    QString scoreP1;
    if (ui->CheckWinP1_3->isChecked())
    {
        scoreP1 = "3";
    }
    else if (ui->CheckWinP1_2->isChecked())
    {
        scoreP1 = "2";
    }
    else if (ui->CheckWinP1_1->isChecked())
    {
        scoreP1 = "1";
    }
    else
    {
        scoreP1 = "0";
    }
    jsonData["p1Score"] = scoreP1;

    //player color, character and skin
    jsonData["p1Color"] = ui->comboBox_5->currentText();
    jsonData["p1Character"] = ui->comboBox->currentText();
    jsonData["p1Skin"] = ui->comboBox_2->currentText();

    //now lets see if the player is [L]osing or [W]inning on a Grand Final
    QString p1GFstatus = "";
    if (ui->checkLP1->isChecked())
    {
        jsonData["p1WL"] = "L";
    }
    else if (ui->checkWP1->isChecked())
    {
        jsonData["p1WL"] = "W";
    }
    else
    {
        jsonData["p1WL"] = "Nada";
    }


    //now we repeat the process for player 2
    //player name
    QString p2FullName = ui->lineEdit_2->text();
    QStringList p2Split = p2FullName.split("|");
    if (p2Split.length() == 2)
    {
        jsonData["p2Name"] = p2Split[1];
        jsonData["p2Team"] = p2Split[0];
    }
    else
    {
        jsonData["p2Name"] = p2Split[0];
        jsonData["p2Team"] = "";
    }

    //player score
    QString scoreP2;
    if (ui->CheckWinP2_3->isChecked())
    {
        scoreP2 = "3";
    }
    else if (ui->CheckWinP2_2->isChecked())
    {
        scoreP2 = "2";
    }
    else if (ui->CheckWinP2_1->isChecked())
    {
        scoreP2 = "1";
    }
    else
    {
        scoreP2 = "0";
    }
    jsonData["p2Score"] = scoreP2;

    //player color, character and skin
    jsonData["p2Color"] = ui->comboBox_6->currentText();
    jsonData["p2Character"] = ui->comboBox_4->currentText();
    jsonData["p2Skin"] = ui->comboBox_3->currentText();

    //[L]osing or [W]inning
    QString p2GFstatus = "";
    if (ui->checkLP2->isChecked())
    {
        jsonData["p2WL"] = "L";
    }
    else if (ui->checkWP2->isChecked())
    {
        jsonData["p2WL"] = "W";
    }
    else
    {
        jsonData["p2WL"] = "Nada";
    }


    //current round
    jsonData["round"] = ui->lineEdit_3->text();

    //is it Best of 3 or Best of 5?
    if (ui->radioButton->isChecked())
    {
        jsonData["bestOf"] = "Bo3";
    }
    else
    {
        jsonData["bestOf"] = "Bo5";
    }

    //name of the tournament
    jsonData["tournamentName"] = ui->tournamentText->text();


    //and now for the caster data
    jsonData["caster1Name"] = ui->lineEdit_4->text();
    jsonData["caster1Twitter"] = ui->lineEdit_5->text();
    jsonData["caster2Name"] = ui->lineEdit_7->text();
    jsonData["caster2Twitter"] = ui->lineEdit_6->text();

    //and finally, the allow intro bool (which isnt really a bool but whatevs)
    if (ui->allowIntro->isChecked())
    {
        jsonData["allowIntro"] = "yes";
    }
    else
    {
        jsonData["allowIntro"] = "no";
    }


    //now we save the data we stored
    QFile theJson("Resources/Texts/ScoreboardInfo.json");
    if (!theJson.open(QIODevice::WriteOnly))
    {
        QMessageBox::warning(this, "Oh no", "The JSON file is missing.");
    }

    QJsonDocument saveDoc(jsonData);
        theJson.write(saveDoc.toJson());

}

void MainWindow::updateP1()
{
    //player 1 name
    QFile txtP1("Resources/Texts/Player 1.txt");

    if (!txtP1.open(QFile::WriteOnly | QFile::Text))
    {
        //
    }

    QTextStream out (&txtP1);
    QString text = ui->lineEdit->text();
    QStringList pSplit = text.split("|");
    if (pSplit.length() == 2)
    {
        text = pSplit[1];
    }
    else
    {
        text = pSplit[0];
    }
    out << text;
    txtP1.flush();
    txtP1.close();
}

void MainWindow::updateP2()
{
    //player 2 name
    QFile txtP2("Resources/Texts/Player 2.txt");

    if (!txtP2.open(QFile::WriteOnly | QFile::Text))
    {
        //
    }

    QTextStream out (&txtP2);
    QString text = ui->lineEdit_2->text();
    QStringList pSplit = text.split("|");
    if (pSplit.length() == 2)
    {
        text = pSplit[1];
    }
    else
    {
        text = pSplit[0];
    }
    out << text;
    txtP2.flush();
    txtP2.close();
}

void MainWindow::updateRound()
{
    //round text
    QFile txt("Resources/Texts/Round.txt");

    if (!txt.open(QFile::WriteOnly | QFile::Text))
    {
        //
    }

    QTextStream out (&txt);
    QString text = ui->lineEdit_3->text();
    out << text;
    txt.flush();
    txt.close();

    //tournament text
    QFile txt2("Resources/Texts/Tournament Name.txt");

    if (!txt2.open(QFile::WriteOnly | QFile::Text))
    {
        //
    }

    QTextStream out2 (&txt2);
    QString text2 = ui->tournamentText->text();
    out2 << text2;
    txt2.flush();
    txt2.close();
}

void MainWindow::updateCasters()
{
    QFile txt("Resources/Texts/Caster 1 Name.txt");

    if (!txt.open(QFile::WriteOnly | QFile::Text))
    {
        //
    }

    QTextStream out (&txt);
    QString text = ui->lineEdit_4->text();
    out << text;
    txt.flush();
    txt.close();


    QFile txt2("Resources/Texts/Caster 1 Twitter.txt");

    if (!txt2.open(QFile::WriteOnly | QFile::Text))
    {
        //
    }

    QTextStream out2 (&txt2);
    QString text2 = ui->lineEdit_5->text();
    out2 << text2;
    txt2.flush();
    txt2.close();


    QFile txt3("Resources/Texts/Caster 2 Name.txt");

    if (!txt3.open(QFile::WriteOnly | QFile::Text))
    {
        //
    }

    QTextStream out3 (&txt3);
    QString text3 = ui->lineEdit_7->text();
    out3 << text3;
    txt3.flush();
    txt3.close();


    QFile txt4("Resources/Texts/Caster 2 Twitter.txt");

    if (!txt4.open(QFile::WriteOnly | QFile::Text))
    {
        //
    }

    QTextStream out4 (&txt4);
    QString text4 = ui->lineEdit_6->text();
    out4 << text4;
    txt4.flush();
    txt4.close();
}

//this right here is to check if the player has a custom skin everytime the text is changed
void MainWindow::on_lineEdit_textChanged(const QString &arg1)
{
    QString character = ui->comboBox->currentText();
    QString player = ui->lineEdit->text();
    //this is so it doesnt read the player team tag
    QStringList pSplit = player.split("|");
    if (pSplit.length() == 2)
    {
        player = pSplit[1];
    }
    else
    {
        player = pSplit[0];
    }

    //now we will check the skin list txt files and add an entry line by line

    //this down here is for the exclusive player skins
    QString pathc = "Resources/Texts/Interface Lists/Player Skins/" + character + ".txt";
    QFile txtc(pathc);

    if (!txtc.open(QFile::ReadOnly | QFile::Text))
    {
        //i was going to include error messages here but they would show on startup
    }

    QTextStream inc(&txtc);
    bool stop = true;
    while (!inc.atEnd())
    {
        QString line = inc.readLine();
        int x = QString::compare(player, line, Qt::CaseInsensitive);
        if (player == "")
        {
            //this is to prevent it from adding an empty option to the combo box in case there is no player name
        }
        else if (x == 0)
        {
            ui->comboBox_2->clear();
            ui->comboBox_2->addItem(player);
            stop = false;
        }
    }

    txtc.flush();
    txtc.close();

    if (!stop)
    {
        //now for the normal skins
        QString path = "Resources/Texts/Interface Lists/Skin Lists/" + character + ".txt";
        QFile txt(path);

        if (!txt.open(QFile::ReadOnly | QFile::Text))
        {
            //i was going to include error messages here but they would show on startup
        }

        QTextStream in(&txt);
        while (!in.atEnd())
        {
            QString line = in.readLine();
            ui->comboBox_2->addItem(line);
        }

        txt.flush();
        txt.close();
    }
}

void MainWindow::on_lineEdit_2_textChanged(const QString &arg1)
{
    QString character = ui->comboBox_4->currentText();
    QString player = ui->lineEdit_2->text();
    //this is so it doesnt read the player team tag
    QStringList pSplit = player.split("|");
    if (pSplit.length() == 2)
    {
        player = pSplit[1];
    }
    else
    {
        player = pSplit[0];
    }

    //now we will check the skin list txt files and add an entry line by line

    //this down here is for the exclusive player skins
    QString pathc = "Resources/Texts/Interface Lists/Player Skins/" + character + ".txt";
    QFile txtc(pathc);

    if (!txtc.open(QFile::ReadOnly | QFile::Text))
    {
        //i was going to include error messages here but they would show on startup
    }

    QTextStream inc(&txtc);
    bool stop = true;
    while (!inc.atEnd())
    {
        QString line = inc.readLine();
        int x = QString::compare(player, line, Qt::CaseInsensitive);
        if (player == "")
        {
            //this is to prevent it from adding an empty option to the combo box in case there is no player name
        }
        else if (x == 0)
        {
            ui->comboBox_3->clear();
            ui->comboBox_3->addItem(player);
            stop = false;
        }
    }

    txtc.flush();
    txtc.close();

    if (!stop)
    {
        //now for the normal skins
        QString path = "Resources/Texts/Interface Lists/Skin Lists/" + character + ".txt";
        QFile txt(path);

        if (!txt.open(QFile::ReadOnly | QFile::Text))
        {
            //i was going to include error messages here but they would show on startup
        }

        QTextStream in(&txt);
        while (!in.atEnd())
        {
            QString line = in.readLine();
            ui->comboBox_3->addItem(line);
        }

        txt.flush();
        txt.close();
    }
}
